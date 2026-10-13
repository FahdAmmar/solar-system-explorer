// The lazy page loaders live here so the router and links can share them: loading a page
// "on intent" (hovering its button) and visiting it later use the same module, so the second
// one is instant.
export const loadExplorePage = () => import('@/pages/ExplorePage')
export const loadComparePage = () => import('@/pages/ComparePage')
