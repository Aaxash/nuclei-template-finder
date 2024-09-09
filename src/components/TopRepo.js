import React, { useState } from 'react';
import './TopRepo.css'; // Import styles for the component
import { FaGithub } from 'react-icons/fa';

function TopRepo() {
    
    const localRepos = [
        { "name": "projectdiscovery/nuclei-templates", "url": "https://github.com/projectdiscovery/nuclei-templates" },
        { "name": "ExpLangcn/NucleiTP", "url": "https://github.com/ExpLangcn/NucleiTP" },
        { "name": "topscoder/nuclei-wordfence-cve", "url": "https://github.com/topscoder/nuclei-wordfence-cve" },
        { "name": "UltimateSec/ultimaste-nuclei-templates", "url": "https://github.com/UltimateSec/ultimaste-nuclei-templates" },
        { "name": "ayadim/Nuclei-bug-hunter", "url": "https://github.com/ayadim/Nuclei-bug-hunter" },
        { "name": "optiv/mobile-nuclei-templates", "url": "https://github.com/optiv/mobile-nuclei-templates" },
        { "name": "SirBugs/Priv8-Nuclei-Templates", "url": "https://github.com/SirBugs/Priv8-Nuclei-Templates" },
        { "name": "linuxadi/40k-nuclei-templates", "url": "https://github.com/linuxadi/40k-nuclei-templates" },
        { "name": "geeknik/the-nuclei-templates", "url": "https://github.com/geeknik/the-nuclei-templates" },
        { "name": "pdelteil/BugBountyReportTemplates", "url": "https://github.com/pdelteil/BugBountyReportTemplates" },
        { "name": "UnaPibaGeek/honeypots-detection", "url": "https://github.com/UnaPibaGeek/honeypots-detection" },
        { "name": "cipher387/juicyinfo-nuclei-templates", "url": "https://github.com/cipher387/juicyinfo-nuclei-templates" }    
    ];

    const [repos] = useState(localRepos); // Use the local array as the initial state

    return (
        <div>
            <div className="repo-section">
            <h1 class="top-repositories">Some Top Repositories</h1>
                <div id="repo-container" className="repo-container">
                    {repos.length > 0 ? (
                        repos.map((repo) => (
                            <div key={repo.name} className='repo-card'>
                                <FaGithub className='github-logo' icon="fa-brands fa-github" />
                                <h2 className='repo-name'>
                                    {repo.url ? (
                                        <a href={repo.url} rel="noreferrer" target='_blank'>{repo.name}</a>
                                    ) : (
                                        <span>{repo.name}</span>
                                    )}
                                </h2>
                            </div>
                        ))
                    ) : (
                        <p>Loading repositories...</p>
                    )}
                </div>
                <div className="more-repos">
                    <a href="/files/repos.txt" target="_blank" className="more-repos-link">View All</a>
                </div>
            </div>
            <footer className="footer">
                <p className="footer-heart">
                    Made with 
                    <img 
                        className="emoji" 
                        alt="heart" 
                        height="20" 
                        width="20" 
                        src="https://github.githubassets.com/images/icons/emoji/unicode/2764.png"
                    /> 
                    by <a rel="noreferrer" target="_blank" href="https://x.com/Aaxashhh">Aakash</a>
                </p>
            </footer>
        </div>
    );
}

export default TopRepo;
