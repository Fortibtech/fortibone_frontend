import Link from 'next/link';
import styles from './about.module.css';
import PublicHeader from '../../components/layout/PublicHeader';
import PublicFooter from '../../components/layout/PublicFooter';

export default function AboutPage() {
    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <PublicHeader variant="solid" />

            <div style={{ paddingTop: '80px', flex: 1 }}>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <h1 className={styles.heroTitle}>
                        Quand la galère devient{' '}
                        <span className={styles.accent}>un système</span>
                    </h1>
                    <p className={styles.heroDescription}>
                        KomoraLink n'est pas né dans un incubateur. Il est né dans la frustration.
                        Dans ce constat simple : on mérite mieux.
                    </p>
                </section>

                <div className={styles.aboutContent}>
                    {/* Mon Parcours */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <span>🛤️</span> Mon Parcours
                        </h2>

                        <div className={styles.storyBlock}>
                            <p>
                                Je n'avais pas de réseau. Pas de diplôme d'école de commerce.
                                Pas d'investisseurs dans mon carnet d'adresses. Pas de famille dans la tech.
                            </p>
                            <p>
                                <strong>J'avais un ordinateur, une connexion internet instable, et une obsession :
                                    comprendre comment ça marche.</strong>
                            </p>
                            <p>
                                J'ai appris seul. La nuit, après le travail. Le week-end, quand les autres sortaient.
                                J'ai lu des documentations en anglais que je ne comprenais pas toujours.
                                J'ai copié du code, cassé des projets, recommencé. J'ai fait des erreurs
                                qui m'ont coûté des mois. J'ai eu des moments où j'ai voulu tout arrêter —
                                et personne autour de moi ne comprenait vraiment ce que j'essayais de construire.
                            </p>
                            <p><strong>Mais je n'ai pas lâché.</strong></p>
                            <p>
                                Pas parce que j'étais sûr de réussir. Mais parce que le problème que je voyais —
                                ce fossé entre les Comores et sa diaspora, cette économie informelle qui tourne en rond,
                                ces commerçants invisibles, ces jeunes sans outils — ce problème-là ne me laissait pas tranquille.
                            </p>
                        </div>

                        <blockquote className={styles.quote}>
                            Les plus grandes solutions naissent souvent des plus grandes difficultés.
                        </blockquote>
                    </section>

                    {/* L'Idée */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <span>💡</span> L'Idée
                        </h2>

                        <div className={styles.storyBlock}>
                            <p className={styles.bigQuestion}>
                                Pourquoi est-ce si compliqué pour un Comorien de France d'acheter quelque chose
                                pour sa famille au pays ?
                            </p>
                            <p>
                                Pourquoi faut-il appeler trois personnes, envoyer de l'argent par des canaux incertains,
                                espérer que le produit arrive ? Pourquoi les commerçants locaux sont-ils invisibles ?
                                Pourquoi les fournisseurs n'ont-ils pas accès aux marchés ? Pourquoi la diaspora —
                                qui envoie des millions chaque année — n'a-t-elle aucun outil pour transformer cet argent
                                en impact économique réel ?
                            </p>
                            <p>
                                <strong>KomoraLink est né de cette frustration.</strong>
                            </p>
                            <p>
                                L'idée : créer un <span className={styles.highlight}>pont économique fiable</span> entre
                                les Comores et sa diaspora. Une plateforme unique où commerçants, fournisseurs, restaurateurs,
                                consommateurs et diaspora se retrouvent dans un écosystème commun — moderne, sécurisé,
                                pensé pour nos réalités.
                            </p>
                        </div>
                    </section>

                    {/* Le Constat */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <span>📊</span> Le Constat
                        </h2>

                        <div className={styles.problemGrid}>
                            <div className={styles.problemCard}>
                                <div className={styles.problemIcon}>🏪</div>
                                <p>Les commerçants n'ont aucune vitrine digitale. Leur marché s'arrête à leur quartier.</p>
                            </div>
                            <div className={styles.problemCard}>
                                <div className={styles.problemIcon}>📦</div>
                                <p>Les fournisseurs n'atteignent pas les bons clients. Ils dépendent du bouche-à-oreille.</p>
                            </div>
                            <div className={styles.problemCard}>
                                <div className={styles.problemIcon}>🌍</div>
                                <p>La diaspora veut contribuer, mais n'a aucun canal fiable. L'argent circule sans traçabilité.</p>
                            </div>
                            <div className={styles.problemCard}>
                                <div className={styles.problemIcon}>💳</div>
                                <p>Les paiements restent informels. Pas de suivi, pas de preuve, pas de confiance.</p>
                            </div>
                        </div>

                        <p className={styles.resultText}>
                            <strong>Résultat ?</strong> Une économie qui tourne en rond. Des talents qui n'émergent pas.
                            Des emplois qui ne se créent pas. Un potentiel énorme qui reste bloqué.
                        </p>
                    </section>

                    {/* La Réponse */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <span>🚀</span> La Réponse : KomoraLink
                        </h2>

                        <p className={styles.introText}>
                            KomoraLink n'est pas une application de plus. C'est un <strong>système complet</strong> qui
                            digitalise, structure et connecte.
                        </p>

                        <div className={styles.solutionGrid}>
                            <div className={styles.solutionCard}>
                                <div className={styles.solutionIcon}>🔗</div>
                                <h4 style={{ fontWeight: 600 }}>Mise en relation</h4>
                                <p>Commerçants, fournisseurs et clients enfin connectés</p>
                            </div>
                            <div className={styles.solutionCard}>
                                <div className={styles.solutionIcon}>🛒</div>
                                <h4 style={{ fontWeight: 600 }}>Achats & ventes</h4>
                                <p>Transactions simples, locales ou depuis l'étranger</p>
                            </div>
                            <div className={styles.solutionCard}>
                                <div className={styles.solutionIcon}>💰</div>
                                <h4 style={{ fontWeight: 600 }}>Paiements intégrés</h4>
                                <p>Wallet sécurisé, alternative au compte bancaire</p>
                            </div>
                            <div className={styles.solutionCard}>
                                <div className={styles.solutionIcon}>🚴</div>
                                <h4 style={{ fontWeight: 600 }}>Livraison</h4>
                                <p>Réseau de livreurs locaux, traçabilité complète</p>
                            </div>
                            <div className={styles.solutionCard}>
                                <div className={styles.solutionIcon}>🌐</div>
                                <h4 style={{ fontWeight: 600 }}>Diaspora</h4>
                                <p>Pouvoir d'achat transformé en soutien économique réel</p>
                            </div>
                        </div>
                    </section>

                    {/* Stats */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>17M€</div>
                            <div className={styles.statLabel}>Volume de transactions visé (2029)</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>9 000</div>
                            <div className={styles.statLabel}>Commerçants intégrés</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>50</div>
                            <div className={styles.statLabel}>Emplois directs créés</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statValue}>+40%</div>
                            <div className={styles.statLabel}>Croissance annuelle</div>
                        </div>
                    </div>

                    {/* La Crédibilité */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <span>🏆</span> La Crédibilité
                        </h2>

                        <div className={styles.storyBlock}>
                            <p>
                                Je ne suis pas seul. KomoraLink est développé par <a href="https://fortibtech.com" target="_blank" rel="noopener noreferrer" style={{ color: '#00c9a7', textDecoration: 'none', fontWeight: 600 }}>FORTIBTECH</a>,
                                structure technologique franco-comorienne que j'ai fondée.
                            </p>
                        </div>

                        <div className={styles.credibilityGrid}>
                            <div className={styles.credibilityItem}>
                                <span className={styles.checkIcon}>✓</span>
                                <p>Une expertise technique interne — pas de dépendance externe</p>
                            </div>
                            <div className={styles.credibilityItem}>
                                <span className={styles.checkIcon}>✓</span>
                                <p>Des solutions déjà déployées dans d'autres contextes africains</p>
                            </div>
                            <div className={styles.credibilityItem}>
                                <span className={styles.checkIcon}>✓</span>
                                <p>Collaboration avec la Chambre de Commerce (CCIA) pour la formation</p>
                            </div>
                            <div className={styles.credibilityItem}>
                                <span className={styles.checkIcon}>✓</span>
                                <p>Une approche terrain — chaque fonctionnalité répond à un problème réel</p>
                            </div>
                        </div>

                        <p className={styles.emphasisText}>
                            KomoraLink n'est pas une idée sur un PowerPoint.
                            C'est un produit qui existe, qui fonctionne, qui évolue.
                        </p>
                    </section>

                    {/* Le Cercle Vertueux */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <span>🔄</span> Le Cercle Vertueux
                        </h2>

                        <div className={styles.virtueCircle}>
                            <div className={styles.circleStep}>Diaspora achète</div>
                            <span className={styles.arrow}>→</span>
                            <div className={styles.circleStep}>Commerçant gagne</div>
                            <span className={styles.arrow}>→</span>
                            <div className={styles.circleStep}>Fournisseur écoule</div>
                            <span className={styles.arrow}>→</span>
                            <div className={styles.circleStep}>Livreur travaille</div>
                            <span className={styles.arrow}>→</span>
                            <div className={styles.circleStep}>Économie se structure</div>
                            <span className={styles.arrow}>→</span>
                            <div className={styles.circleStep}>Diaspora a confiance</div>
                            <span className={styles.arrowLoop}>↻</span>
                        </div>

                        <p className={styles.centerText}>
                            Chaque transaction crée de la valeur. Chaque utilisateur renforce le réseau.
                            <strong> La valeur reste au service du pays.</strong>
                        </p>
                    </section>

                    {/* Ce Qui M'a Mis en Mouvement */}
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <span>🔥</span> Ce Qui M'a Mis en Mouvement
                        </h2>

                        <div className={styles.motivationList}>
                            <div className={styles.motivationItem}>
                                <span className={styles.eyeIcon}>👁️</span>
                                <p>J'ai vu des entrepreneurs incapables de savoir si leur commerce était rentable.</p>
                            </div>
                            <div className={styles.motivationItem}>
                                <span className={styles.eyeIcon}>👁️</span>
                                <p>J'ai vu des gens déléguer leur business et se faire voler sans moyen de le prouver.</p>
                            </div>
                            <div className={styles.motivationItem}>
                                <span className={styles.eyeIcon}>👁️</span>
                                <p>J'ai vu des jeunes avec des idées mais aucun outil pour les exécuter.</p>
                            </div>
                            <div className={styles.motivationItem}>
                                <span className={styles.eyeIcon}>👁️</span>
                                <p>J'ai vu une diaspora qui envoie des milliards chaque année, sans aucun moyen de s'assurer que cet argent crée vraiment de la valeur.</p>
                            </div>
                            <div className={styles.motivationItem}>
                                <span className={styles.eyeIcon}>👁️</span>
                                <p>J'ai vu un système où l'informel profite à quelques-uns, et bloque tous les autres.</p>
                            </div>
                        </div>

                        <blockquote className={styles.finalQuote}>
                            Et j'ai décidé que l'observation ne suffisait plus.<br />
                            <strong>Il est temps de passer à l'action sur des choses sérieuses.</strong><br />
                            Il faut structurer. Outiller. Convaincre.
                        </blockquote>
                    </section>

                    {/* Conclusion */}
                    <section className={styles.section}>
                        <div className={styles.conclusionBox}>
                            <h3 className={styles.conclusionTitle}>
                                KomoraLink, c'est ça. Pas une promesse. Un commencement.
                            </h3>
                            <p className={styles.tagline}>
                                <strong>KomoraLink</strong> — Connecter l'économie locale à sa diaspora.
                            </p>

                            <div className={styles.cta}>
                                <Link href="/docs" className={`${styles.ctaButton} ${styles.ctaPrimary}`}>
                                    Découvrir KomoraLink
                                </Link>
                                <Link href="/dashboard" className={`${styles.ctaButton} ${styles.ctaSecondary}`}>
                                    Voir le Dashboard
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <PublicFooter />
        </div>
    );
}
