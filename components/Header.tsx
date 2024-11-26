import Head from 'next/head';

export default function Header() {
    return (
        <>
            <Head>
                <title>Leftovers Love</title>
                <meta
                    name="description"
                    content="Reduce food waste by suggesting recipes for leftovers"
                />
            </Head>
            <header className="text-center mb-5">
                <h1 className="text-2xl font-bold">Welcome to Leftovers Love</h1>
                <p>Reduce food waste by suggesting recipes for leftovers.</p>
            </header>
        </>
    );
}