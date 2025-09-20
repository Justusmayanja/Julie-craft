import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="flex min-h-[60vh] w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Sorry, something went wrong.</CardTitle>
                </CardHeader>
                <CardContent>
                  {params?.error ? (
                    <p className="text-sm text-muted-foreground">Code error: {params.error}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">An unspecified error occurred.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
