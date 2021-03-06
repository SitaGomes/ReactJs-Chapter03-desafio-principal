export default function Comments () {
    return(
        <section
            ref={elem => {
                if (!elem) {
                    return;
                }
                const scriptElem = document.createElement("script");
                scriptElem.src = "https://utteranc.es/client.js";
                scriptElem.async = true;
                scriptElem.crossOrigin = "anonymous";
                scriptElem.setAttribute("repo", "SitaGomes/ReactJs-Chapter03-desafio-principal");
                scriptElem.setAttribute("issue-term", "pathname");
                scriptElem.setAttribute("label", "SpaceTraveling-blog-comments");
                scriptElem.setAttribute("theme", "photon-dark");
                elem.appendChild(scriptElem);
            }}
        />
    )
}