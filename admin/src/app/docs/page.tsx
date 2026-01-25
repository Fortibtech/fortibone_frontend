'use client';

import Link from 'next/link';
import styles from './docs.module.css';

export default function DocsPage() {
    return (
        <div className={styles.docsMain}>
            <h1 className={styles.docTitle}>Documentation Utilisateur KomoraLink</h1>
            <p className={styles.docDescription}>
                Guide complet pour utiliser l'application KomoraLink - plateforme de commerce
                tout-en-un pour les Comores et sa diaspora.
            </p>

            {/* Introduction */}
            <section className={styles.docSection} id="introduction">
                <h2 className={styles.sectionTitle}>📖 1. Introduction</h2>
                <div className={styles.sectionContent}>
                    <h3>Présentation de KomoraLink</h3>
                    <p>
                        KomoraLink est une application mobile et web tout-en-un conçue pour faciliter
                        les échanges commerciaux entre particuliers et professionnels. Elle offre une
                        plateforme unique où :
                    </p>
                    <ul>
                        <li>Les <strong>particuliers</strong> peuvent découvrir des commerces, commander des produits, réserver des tables dans des restaurants et gérer leurs paiements</li>
                        <li>Les <strong>professionnels</strong> (commerçants, fournisseurs, restaurateurs, livreurs) peuvent gérer leurs activités commerciales de manière centralisée</li>
                    </ul>

                    <h3>À qui s'adresse KomoraLink ?</h3>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Profil</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Particulier</td>
                                <td>Tout utilisateur souhaitant acheter des produits, commander des repas ou découvrir des commerces locaux</td>
                            </tr>
                            <tr>
                                <td>Commerçant</td>
                                <td>Propriétaires de boutiques souhaitant vendre leurs produits en ligne</td>
                            </tr>
                            <tr>
                                <td>Fournisseur</td>
                                <td>Professionnels vendant en gros aux autres entreprises</td>
                            </tr>
                            <tr>
                                <td>Restaurateur</td>
                                <td>Propriétaires de restaurants souhaitant gérer leurs commandes et réservations</td>
                            </tr>
                            <tr>
                                <td>Livreur</td>
                                <td>Professionnels de la livraison proposant leurs services</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Accès */}
            <section className={styles.docSection} id="acces">
                <h2 className={styles.sectionTitle}>📲 2. Accès à l'application</h2>
                <div className={styles.sectionContent}>
                    <h3>Télécharger l'application mobile</h3>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Plateforme</th>
                                <th>Comment télécharger</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Android</td>
                                <td>Recherchez "KomoraLink" sur le Google Play Store</td>
                            </tr>
                            <tr>
                                <td>iOS</td>
                                <td>Recherchez "KomoraLink" sur l'App Store</td>
                            </tr>
                        </tbody>
                    </table>

                    <h3>Accéder via le web</h3>
                    <p>L'application web est accessible à l'adresse : <strong>https://app.komoralink.com</strong></p>

                    <div className={styles.callout}>
                        <div className={styles.calloutTitle}>💡 Note</div>
                        <div className={styles.calloutContent}>
                            La version web offre les mêmes fonctionnalités que l'application mobile.
                            Les professionnels apprécieront l'écran plus grand pour la gestion quotidienne.
                        </div>
                    </div>

                    <h3>Prérequis techniques</h3>
                    <ul>
                        <li>✅ Une connexion internet stable (Wi-Fi ou données mobiles)</li>
                        <li>✅ Un numéro de téléphone valide pour la vérification OTP</li>
                        <li>✅ Une adresse email unique pour votre compte</li>
                        <li>✅ Smartphone Android 8.0+ ou iOS 13+, ou navigateur web récent</li>
                    </ul>
                </div>
            </section>

            {/* Création de compte */}
            <section className={styles.docSection} id="inscription">
                <h2 className={styles.sectionTitle}>📝 3. Création de compte</h2>
                <div className={styles.sectionContent}>
                    <h3>Étape 1 : Choix du profil</h3>
                    <p>Lors du premier lancement, choisissez votre type de profil :</p>
                    <ul>
                        <li><strong>Particulier</strong> : Pour acheter des produits et services</li>
                        <li><strong>Professionnel</strong> : Pour proposer vos produits/services</li>
                    </ul>

                    <div className={styles.callout} style={{ borderLeftColor: 'var(--color-warning)', background: 'rgba(245, 158, 11, 0.1)' }}>
                        <div className={styles.calloutTitle}>⚠️ Important</div>
                        <div className={styles.calloutContent}>
                            Ce choix détermine les fonctionnalités accessibles. Un particulier pourra
                            toujours créer une entreprise plus tard.
                        </div>
                    </div>

                    <h3>Étape 2 : Informations personnelles</h3>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Champ</th>
                                <th>Description</th>
                                <th>Obligatoire</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Prénom</td><td>Votre prénom</td><td>✅</td></tr>
                            <tr><td>Nom</td><td>Votre nom de famille</td><td>✅</td></tr>
                            <tr><td>Sexe</td><td>Masculin ou Féminin</td><td>✅</td></tr>
                            <tr><td>Date de naissance</td><td>Votre date de naissance</td><td>✅</td></tr>
                            <tr><td>Email</td><td>Adresse email unique</td><td>✅</td></tr>
                            <tr><td>Mot de passe</td><td>Min. 8 caractères avec majuscule, minuscule et chiffre</td><td>✅</td></tr>
                        </tbody>
                    </table>

                    <h3>Étape 3 : Vérification OTP</h3>
                    <p>Un code à 6 chiffres est envoyé par SMS. Saisissez-le pour valider votre compte.</p>

                    <h3>Étape 4 : Compte créé !</h3>
                    <ul>
                        <li>✅ Votre compte est créé avec succès</li>
                        <li>✅ Un wallet (portefeuille) est automatiquement associé</li>
                        <li>✅ Vous êtes redirigé vers l'accueil</li>
                    </ul>
                </div>
            </section>

            {/* Profil Particulier */}
            <section className={styles.docSection} id="particulier">
                <h2 className={styles.sectionTitle}>👤 5. Profil Particulier</h2>
                <div className={styles.sectionContent}>
                    <p>Le profil Particulier permet d'explorer, acheter et consommer sur la plateforme.</p>

                    <h3>5.1 Accueil - Exploration</h3>
                    <table className={styles.table}>
                        <thead>
                            <tr><th>Action</th><th>Comment faire</th><th>Résultat</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Rechercher</td><td>Tapez dans la barre de recherche</td><td>Suggestions en temps réel</td></tr>
                            <tr><td>Voir la carte</td><td>Icône carte</td><td>Commerces autour de vous</td></tr>
                            <tr><td>Ajouter au panier</td><td>Bouton dans les détails</td><td>Produit ajouté</td></tr>
                        </tbody>
                    </table>

                    <h3>5.2 Entreprises</h3>
                    <p>Parcourez les commerces et restaurants avec filtres par catégorie et secteur.</p>

                    <h3>5.3 Suivi des commandes</h3>
                    <table className={styles.table}>
                        <thead>
                            <tr><th>Statut</th><th>Signification</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>En attente</td><td>Commande reçue, en attente de confirmation</td></tr>
                            <tr><td>Confirmée</td><td>Commande acceptée par le vendeur</td></tr>
                            <tr><td>En préparation</td><td>Produits en cours de préparation</td></tr>
                            <tr><td>Expédiée</td><td>En cours de livraison</td></tr>
                            <tr><td>Livrée</td><td>Commande livrée avec succès</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Profil Commerçant */}
            <section className={styles.docSection} id="commercant">
                <h2 className={styles.sectionTitle}>🏪 6. Profil Commerçant</h2>
                <div className={styles.sectionContent}>
                    <p>Pour les propriétaires de boutiques souhaitant vendre via KomoraLink.</p>

                    <h3>6.1 Tableau de bord</h3>
                    <ul>
                        <li>Sélecteur d'entreprise (si plusieurs)</li>
                        <li>Filtre de période (jour, semaine, mois, année)</li>
                        <li>Carte CA (Chiffre d'Affaires)</li>
                        <li>Commandes en attente</li>
                        <li>Articles vendus</li>
                    </ul>

                    <h3>6.2 Produits / Inventaire</h3>
                    <p>Gérez votre catalogue : ajout, modification, stock, dates d'expiration.</p>

                    <h3>6.3 Ventes</h3>
                    <p>Traitez les commandes : confirmer, préparer, livrer.</p>

                    <h3>6.4 Multi-entreprises</h3>
                    <div className={styles.callout} style={{ borderLeftColor: 'var(--color-warning)', background: 'rgba(245, 158, 11, 0.1)' }}>
                        <div className={styles.calloutTitle}>⚠️ Important</div>
                        <div className={styles.calloutContent}>
                            Le wallet est unique par compte, pas par entreprise. Toutes vos entreprises partagent le même portefeuille.
                        </div>
                    </div>
                </div>
            </section>

            {/* Module Wallet */}
            <section className={styles.docSection} id="wallet">
                <h2 className={styles.sectionTitle}>💰 10. Module Wallet</h2>
                <div className={styles.sectionContent}>
                    <p>Le Wallet est le portefeuille électronique intégré à KomoraLink.</p>

                    <div className={styles.callout} style={{ borderLeftColor: 'var(--color-error)', background: 'rgba(239, 68, 68, 0.1)' }}>
                        <div className={styles.calloutTitle}>🚨 Point crucial</div>
                        <div className={styles.calloutContent}>
                            Le wallet est unique par compte utilisateur. Il est partagé entre toutes vos entreprises.
                        </div>
                    </div>

                    <h3>Dépôt d'argent</h3>
                    <table className={styles.table}>
                        <thead>
                            <tr><th>Méthode</th><th>Description</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Carte bancaire (Stripe)</td><td>Visa, Mastercard - Paiement instantané</td></tr>
                            <tr><td>KARTAPAY</td><td>Paiement mobile (MVola, Orange Money)</td></tr>
                        </tbody>
                    </table>

                    <h3>Retrait et Transfert</h3>
                    <ul>
                        <li><strong>Retrait</strong> : Récupérez de l'argent de votre wallet</li>
                        <li><strong>Transfert</strong> : Envoyez de l'argent à un autre utilisateur KomoraLink</li>
                    </ul>

                    <h3>Montants minimums</h3>
                    <ul>
                        <li>Dépôt : Minimum 1 000</li>
                        <li>Retrait : Minimum 1 000</li>
                        <li>Transfert : Minimum 100</li>
                    </ul>
                </div>
            </section>

            {/* FAQ */}
            <section className={styles.docSection} id="faq">
                <h2 className={styles.sectionTitle}>❓ 12. FAQ</h2>
                <div className={styles.sectionContent}>
                    <h3>Compte et connexion</h3>
                    <p><strong>Q : Je n'ai pas reçu mon code OTP ?</strong></p>
                    <ul>
                        <li>Vérifiez votre numéro de téléphone</li>
                        <li>Attendez quelques minutes</li>
                        <li>Appuyez sur "Renvoyer le code"</li>
                    </ul>

                    <p><strong>Q : Puis-je avoir plusieurs comptes ?</strong></p>
                    <p>Non, un seul compte par email et par numéro de téléphone.</p>

                    <h3>Wallet et paiements</h3>
                    <p><strong>Q : Mon wallet est partagé entre mes entreprises ?</strong></p>
                    <p>Oui, le wallet est unique par compte utilisateur. Toutes vos entreprises l'utilisent.</p>

                    <p><strong>Q : Combien de temps prend un dépôt ?</strong></p>
                    <ul>
                        <li>Carte bancaire : Instantané</li>
                        <li>Mobile Money : Quelques minutes</li>
                    </ul>

                    <h3>Besoin d'aide ?</h3>
                    <p>📧 Email : <strong>support@komoralink.com</strong></p>
                    <p>📱 Dans l'app : Profil → Aide → Contacter le support</p>
                </div>
            </section>

            <div className={styles.callout}>
                <div className={styles.calloutTitle}>📚 Documentation officielle KomoraLink</div>
                <div className={styles.calloutContent}>
                    Version 1.0 - Dernière mise à jour : Janvier 2026
                </div>
            </div>
        </div>
    );
}
