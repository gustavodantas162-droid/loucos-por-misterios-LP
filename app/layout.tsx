import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Loucos por Mistério | Jogos de Investigação para Casais',
  description: 'Transforme uma noite comum em uma investigação criminal. Analise pistas, interrogue suspeitos e desvende casos misteriosos com seu parceiro.',
  openGraph: {
    title: 'Loucos por Mistério | Jogos de Investigação para Casais',
    description: 'Transforme uma noite comum em uma investigação criminal. Analise pistas, interrogue suspeitos e desvende casos misteriosos com seu parceiro.',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://loucos-por-misterio.gustavocarreiraa.chatgpt.site',
  },
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
