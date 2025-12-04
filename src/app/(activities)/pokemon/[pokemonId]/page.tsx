import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSavedPokemonById, getPokemonReviews } from "@/lib/actions/pokemon";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DeletePokemonButton } from "@/components/pokemon/delete-pokemon-button";
import { AddPokemonReviewForm } from "@/components/pokemon/add-review-form";
import { PokemonReviewList } from "@/components/pokemon/review-list";

interface PokemonDetailPageProps {
  params: Promise<{
    pokemonId: string;
  }>;
}

export default async function PokemonDetailPage({ params }: PokemonDetailPageProps) {
  const { pokemonId } = await params;
  
  const [pokemonResult, reviewsResult] = await Promise.all([
    getSavedPokemonById(pokemonId),
    getPokemonReviews(pokemonId),
  ]);

  if (!pokemonResult.success || !pokemonResult.data) {
    notFound();
  }

  const savedPokemon = pokemonResult.data;
  const reviews = reviewsResult.data;

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + parseInt(r.rating), 0) / reviews.length
      : 0;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/pokemon">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pokemon
          </Link>
        </Button>
        <DeletePokemonButton id={savedPokemon.id} name={savedPokemon.name} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pokemon Section */}
        <Card className="overflow-hidden">
          <div className="relative aspect-square bg-muted/30">
            <Image
              src={savedPokemon.imageUrl}
              alt={savedPokemon.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-4"
              priority
            />
          </div>
          <CardContent className="p-4">
            <h1 className="text-xl font-bold capitalize">{savedPokemon.name}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(avgRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span>
                  {avgRating > 0 ? avgRating.toFixed(1) : "No ratings"}
                </span>
              </div>
              <span>•</span>
              <span>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground" suppressHydrationWarning>
              Added {formatDistanceToNow(new Date(savedPokemon.createdAt), { addSuffix: true })}
            </p>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add a Review</CardTitle>
              <CardDescription>
                Share your thoughts about {savedPokemon.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddPokemonReviewForm pokemonId={pokemonId} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
              <CardDescription>
                {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PokemonReviewList reviews={reviews} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
