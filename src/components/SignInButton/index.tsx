import styles from './styles.module.scss';
import { FaGithub } from 'react-icons/fa'
import { FiX } from 'react-icons/fi'
import { signIn, signOut, useSession } from 'next-auth/client'

export function SignInButton(){
    const [session] = useSession(); // Retorna várias informações, nesse caso
    // foi desestruturado e retornado apenas a session, que informa se o usuário
    //está logado ou não.
    return session ? (
        <button 
            type="button" 
            className={styles.signInButton}
            onClick ={() => signOut()}
        >
            <FaGithub color="#04d361"/>
            {session.user.name}
            <FiX className={styles.closeIcon}/>
        </button>
    ) : (
        <button 
            type="button" 
            className={styles.signInButton}
            onClick={() =>signIn('github') }>
            <FaGithub color="#eba417"/>
            Sign In with GitHub
        </button>
    );
}