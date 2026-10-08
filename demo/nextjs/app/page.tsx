import { LegalMoves } from "./components/LegalMoves";

export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <h1 style={{ fontSize: "1.3rem" }}>@intermezzo-chess/chessground-react in Next.js</h1>
      <p>
        This page installs <code>@intermezzo-chess/chessground-react</code> as a real dependency
        (via <code>dist/</code>, not aliased source) to verify the library behaves correctly
        under a real bundler — in particular, that <code>style.css</code> survives production
        tree-shaking rather than being silently stripped.
      </p>
      <LegalMoves />
    </main>
  );
}
