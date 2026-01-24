'use client';

import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';
import styles from './help.module.css';
import { useState } from 'react';

const faqs = [
    {
        question: 'Comment passer une commande ?',
        answer: 'Parcourez le catalogue, ajoutez des produits à votre panier, puis cliquez sur "Commander". Remplissez les informations de livraison et validez le paiement.',
    },
    {
        question: 'Quels sont les modes de paiement acceptés ?',
        answer: 'Nous acceptons les paiements par carte bancaire, Mobile Money, et paiement à la livraison selon les commerçants.',
    },
    {
        question: 'Comment suivre ma commande ?',
        answer: 'Rendez-vous dans "Mes Commandes" depuis votre profil. Vous verrez le statut en temps réel de chaque commande.',
    },
    {
        question: 'Puis-je annuler ou modifier ma commande ?',
        answer: 'Vous pouvez annuler une commande tant qu\'elle n\'a pas été confirmée par le commerçant. Contactez le support pour toute modification.',
    },
    {
        question: 'Comment contacter un commerçant ?',
        answer: 'Sur la page du commerçant, vous trouverez ses coordonnées (téléphone, email). Vous pouvez aussi utiliser le chat intégré.',
    },
    {
        question: 'Que faire si un produit est défectueux ?',
        answer: 'Contactez immédiatement le commerçant via la page de commande. Vous pouvez demander un remboursement ou un échange dans les 7 jours.',
    },
];

export default function HelpPage() {
    const router = useRouter();
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleSubmitContact = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        setSending(true);
        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert('Message envoyé ! Nous vous répondrons dans les plus brefs délais.');
            setName('');
            setEmail('');
            setMessage('');
        } catch (error) {
            alert('Erreur lors de l\'envoi du message');
        } finally {
            setSending(false);
        }
    };

    return (
        <DashboardLayout businessType="PARTICULIER">
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <button onClick={() => router.back()} className={styles.backButton}>
                        ←
                    </button>
                    <h1 className={styles.title}>Aide & Support</h1>
                    <div style={{ width: 45 }} />
                </div>

                <div className={styles.content}>
                    {/* FAQ Section */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>❓ Questions fréquentes</h2>
                        <div className={styles.faqList}>
                            {faqs.map((faq, index) => (
                                <div key={index} className={styles.faqItem}>
                                    <button
                                        className={styles.faqQuestion}
                                        onClick={() => toggleFaq(index)}
                                    >
                                        <span>{faq.question}</span>
                                        <span className={styles.faqIcon}>
                                            {openIndex === index ? '−' : '+'}
                                        </span>
                                    </button>
                                    {openIndex === index && (
                                        <div className={styles.faqAnswer}>
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>✉️ Contactez-nous</h2>
                        <p className={styles.description}>
                            Vous n'avez pas trouvé la réponse ? Envoyez-nous un message.
                        </p>
                        <form onSubmit={handleSubmitContact} className={styles.contactForm}>
                            <div className={styles.formGroup}>
                                <label>Nom</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Votre nom"
                                    disabled={sending}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="votre@email.com"
                                    disabled={sending}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Décrivez votre problème ou votre question..."
                                    rows={5}
                                    disabled={sending}
                                />
                            </div>
                            <button type="submit" className={styles.submitButton} disabled={sending}>
                                {sending ? 'Envoi en cours...' : 'Envoyer le message'}
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>📞 Autres moyens de contact</h2>
                        <div className={styles.contactInfo}>
                            <div className={styles.contactItem}>
                                <span className={styles.contactIcon}>📧</span>
                                <a href="mailto:support@komoralink.com" className={styles.contactLink}>
                                    support@komoralink.com
                                </a>
                            </div>
                            <div className={styles.contactItem}>
                                <span className={styles.contactIcon}>📱</span>
                                <a href="tel:+261340000000" className={styles.contactLink}>
                                    +261 34 00 000 00
                                </a>
                            </div>
                            <div className={styles.contactItem}>
                                <span className={styles.contactIcon}>⏰</span>
                                <span className={styles.contactText}>
                                    Lundi - Samedi : 8h - 18h
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
