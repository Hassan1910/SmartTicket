import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface MarketingLayoutProps {
    children: React.ReactNode
}

export default async function MarketingLayout({ children }: MarketingLayoutProps) {
    const session = await getServerSession(authOptions)

    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader user={session?.user} />
            <main className="flex-1">{children}</main>
            <SiteFooter />
        </div>
    )
}
