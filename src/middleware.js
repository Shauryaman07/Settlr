import { createMiddleware } from '@clerk/clerk-react';

const publicPaths = ['/', '/sign-in*', '/sign-up*'];

const isPublic = (path) => {
  return publicPaths.find(x => 
    path.match(new RegExp(`^${x}$`.replace('*$', '($|/)')))
  );
};

export default createMiddleware({
  publicRoutes: (req) => isPublic(req.url),
  afterAuth: (auth, req, evt) => {
    // Handle users who aren't authenticated
    if (!auth.userId && !isPublic(req.url)) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return Response.redirect(signInUrl);
    }
  },
}); 