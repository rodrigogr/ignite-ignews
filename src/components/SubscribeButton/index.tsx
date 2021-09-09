import { useSession, signIn } from 'next-auth/client';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss'

interface SubscribeButtonProps {
    priceId: string;
}

export function SubscribeButton ({priceId}: SubscribeButtonProps) {
    const [session] = useSession();
    // Sempre que redirecionar um usuário por uma função programática e não por
    // um botão, utilizaremos useRouter()
    const router = useRouter();

    async function handleSubscribe(){
        if(!session) {
            signIn('github')
            return;
        }

        if(session.activeSubscription) {
            router.push('/posts')
            return;
        }

        try {
            const response = await api.post('/subscribe')
            const { sessionId } = response.data;
            const stripe = await getStripeJs();
            //await quando queremos que seja finalizado
            //Redireciona ao checkout
            await stripe.redirectToCheckout({ sessionId });
        } catch(err) {
            alert(err.message);
        }
    }
    
    return (
        <button 
            type="button"
            className={styles.subscribeButton}
            onClick={() => handleSubscribe()}
        >
            Subscribe now
        </button>
    );
}