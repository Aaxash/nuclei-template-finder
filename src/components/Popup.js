import React, { useState, useEffect } from 'react';
import './Popup.css'; // Ensure the CSS file path is correct
import { FaCopy, FaGithub, FaCode, FaTimes } from 'react-icons/fa'; // Ensure correct import
import { toast } from 'react-toastify'; // Import toast
import '../App.css'; // Ensure App.css is correct
import { formatSeverity, getSeverityClass } from '../utils/helpers';

function Popup({ data, onClose }) {
    const { n, s, r, p } = data || {};
    const [codeSnippet, setCodeSnippet] = useState('');

    // Ensure valid repo and path
    const rawLink = r && p ? `https://raw.githubusercontent.com/${r}/main/${p}` : '';

    useEffect(() => {
        if (r && p) {
            setCodeSnippet(`nuclei -t ${rawLink} -u https://URL`);
        }
    }, [r, p, rawLink]);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeSnippet)
            .then(() => {
                toast.success('Code copied to clipboard!'); // Show success toast
            })
            .catch(err => {
                console.error('Failed to copy code: ', err);
                toast.error('Failed to copy code'); // Show error toast
            });
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <button className="popup-close" onClick={onClose}>
                    <FaTimes /> {/* Icon or text */}
                </button>
                <h2>
                    {n || 'No name provided'}
                    {s && (
                        <span className={`severity ${getSeverityClass(s)}`}>
                            {formatSeverity(s)}
                        </span>
                    )}
                </h2>
                {codeSnippet ? (
                    <div className="code-section">
                        <pre><code>{codeSnippet}</code></pre>
                    </div>
                ) : (
                    <p>No code snippet available</p>
                )}
                <div className="popup-buttons">
                    <button className="popup-button" onClick={handleCopy}>
                        <FaCopy />
                    </button>
                    {rawLink && (
                        <a className="popup-button" href={rawLink} target="_blank" rel="noopener noreferrer">
                            <FaCode />
                        </a>
                    )}
                    {r && (
                        <a className="popup-button" href={`https://github.com/${r}`} target="_blank" rel="noopener noreferrer">
                            <FaGithub />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Popup;
