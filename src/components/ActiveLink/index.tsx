import { useRouter } from 'next/router';
import Link, { LinkProps } from 'next/link'
import { ReactElement, cloneElement } from 'react'

interface ActiveLinkProps extends LinkProps {
    children: ReactElement;
    activeClassName: string;
}

export function ActiveLink({ children, activeClassName, ...rest }: ActiveLinkProps){
    const { asPath } = useRouter(); // asPath é a Rota que está sendo acessada 
    //no momento. Ex. / ou /posts
    
    const className = asPath === rest.href 
        ? activeClassName
        : '';
    
    return (
        //Pegando todas as propriedades que passa pelo ActiveLink que não são
        //children e activeClassName e repassando pra dentro do <Link>
        <Link {...rest}>
            {cloneElement(children, { // clonando o children e adicionando className
                className,
            })}
        </Link>
    )
}