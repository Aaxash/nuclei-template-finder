import React, { useState, useEffect, useRef } from 'react';
import './Main.css';
import Popup from './Popup';
import Spinner from './Spinner'; // Import the spinner component
import { searchData, setupIndexedDB } from '../utils/indexedDBUtils';
import { formatSeverity, getSeverityClass } from '../utils/helpers';

function Main() {
    const [search, setSearch] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [visibleData, setVisibleData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [db, setDb] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [showResults, setShowResults] = useState(false);
    const searchResultsRef = useRef(null);

    const ITEMS_PER_PAGE = 40;
    const current_year = new Date().getFullYear();

    const suggestions = [
        "RCE",
        `CVE-${current_year}`,
        "XSS",
        "SSRF",
        "LFI","WORDPRESS"
    ];

    useEffect(() => {
        async function initializeDB() {
            try {
                const database = await setupIndexedDB();
                setDb(database);
            } catch (error) {
                console.error('Failed to set up IndexedDB:', error);
            }
        }
        initializeDB();
    }, []); // Only runs once when the component mounts

    useEffect(() => {
        async function fetchData(query) {
            if (db && query.trim() !== "") {
                setLoading(true);
                try {
                    const results = await searchData(db, query);
                    if (Array.isArray(results)) {
                        setFilteredData(results);
                        if (results.length > 0) {
                            setVisibleData(results.slice(0, ITEMS_PER_PAGE));
                            setPage(1);
                            setShowResults(true);
                        } else {
                            setVisibleData([]);
                            setShowResults(false);
                        }
                    } else {
                        console.error('Unexpected data format:', results);
                        setFilteredData([]);
                        setVisibleData([]);
                        setShowResults(false);
                    }
                } catch (error) {
                    console.error('Error searching data:', error);
                    setFilteredData([]);
                    setVisibleData([]);
                    setShowResults(false);
                }
                setLoading(false);
            } else {
                setFilteredData([]);
                setVisibleData([]);
                setShowResults(false);
            }
        }

        if (search.trim() !== "") {
            fetchData(search);
        } else {
            setFilteredData([]);
            setVisibleData([]);
            setShowResults(false);
        }
    }, [search, db]); // Dependency array includes `search` and `db`

    const handleScroll = () => {
        const container = searchResultsRef.current;
        if (container.scrollTop + container.clientHeight >= container.scrollHeight && !loading) {
            loadMoreData();
        }
    };

    const loadMoreData = () => {
        const nextPage = page + 1;
        const startIndex = nextPage * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const newItems = filteredData.slice(startIndex, endIndex);

        if (newItems.length > 0) {
            setVisibleData((prev) => [...prev, ...newItems]);
            setPage(nextPage);
        }
    };

    const handleItemClick = (item) => {
        if (item && item.n && item.s) {
            setSelectedItem(item);
        } else {
            console.error('Invalid item clicked:', item);
        }
    };

    const handleClosePopup = () => {
        setSelectedItem(null);
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearch(suggestion);
    };

    return (
        <div>
            <div className="search-suggestions">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        className="suggestion-button"
                        onClick={() => handleSuggestionClick(suggestion)}
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
            <div className="search-container">
                <form onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="text"
                        name="search"
                        onChange={handleSearchChange}
                        value={search}
                        id="search"
                        autoComplete="off"
                        placeholder="Search Community Templates... (Search by Names, Tags, Severity)"
                        aria-label="Search input"
                    />
                </form>
                {loading ? (
                    <Spinner /> // Show spinner while loading
                ) : (
                    search.trim() !== "" && (
                        <p>Total results found: {filteredData.length}</p>
                    )
                )}
                {showResults && (
                    <div
                        id="search-results"
                        className="search-results"
                        ref={searchResultsRef}
                        onScroll={handleScroll}
                    >
                        {filteredData.length > 0 ? (
                            visibleData.length > 0 ? (
                                visibleData.map((item, index) => (
                                    <div
                                        key={index}
                                        className="template-item"
                                        onClick={() => handleItemClick(item)}
                                        role="button"
                                        aria-label={`Select template ${item.n}`}
                                    >
                                        <h3>
                                            - {item.n}
                                            <span className={`severity ${getSeverityClass(item.s)}`}>
                                                {formatSeverity(item.s)}
                                            </span>
                                            <span>
                                               from {item.r}
                                            </span>
                                        </h3>
                                    </div>
                                ))
                            ) : (
                                <p>No results found</p>
                            )
                        ) : (
                            <p>No results found</p>
                        )}
                    </div>
                )}
            </div>

            {selectedItem && <Popup data={selectedItem} onClose={handleClosePopup} />}
        </div>
    );
}

export default Main;
