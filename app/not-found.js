import Link from 'next/link';
export default function NotFound() {
  return (<main className="w" style={{ padding: '22vh 24px', textAlign: 'center' }}><h1>404</h1><p className="mu">This page does not exist.</p><Link className="btn" href="/">Back to home</Link></main>);
}
