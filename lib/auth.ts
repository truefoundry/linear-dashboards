import { AuthOptions } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    {
      id: "linear",
      name: "Linear",
      type: "oauth",
      authorization: {
        url: "https://linear.app/oauth/authorize",
        params: {
          scope: "read",
          response_type: "code",
        },
      },
      token: "https://api.linear.app/oauth/token",
      userinfo: {
        url: "https://api.linear.app/graphql",
        async request({ tokens }) {
          const res = await fetch("https://api.linear.app/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokens.access_token}`,
            },
            body: JSON.stringify({
              query: `{ viewer { id name email avatarUrl } }`,
            }),
          });
          const json = await res.json();
          return json.data?.viewer;
        },
      },
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.avatarUrl,
        };
      },
      clientId: process.env.LINEAR_CLIENT_ID!,
      clientSecret: process.env.LINEAR_CLIENT_SECRET!,
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
