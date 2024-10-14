import React from 'react';

// Define types for the QR code scan result.
type Result = {
    decodedText: string;
    result: {
        format: {
            formatName: string;
        };
    };
};

type ScanResult = {
    name: string
    roll: string
    email: string
    phone: string
    veg_nonveg: string
    tshirt_size: string
    dept: string
    jwtToken: string
} | null

// Filter results to remove duplicate decoded texts.
function filterResults(results: Result[]): Result[] {
    let filteredResults: Result[] = [];
    for (let i = 0; i < results.length; ++i) {
        if (i === 0) {
            filteredResults.push(results[i]);
            continue;
        }

        if (results[i].decodedText !== results[i - 1].decodedText) {
            filteredResults.push(results[i]);
        }
    }
    return filteredResults;
}

// Define props for the table component.
interface ResultContainerTableProps {
    data: Result[];
}

// Define the ResultContainerTable component to display results in a table.
const ResultContainerTable: React.FC<ResultContainerTableProps> = ({ data }) => {
    const results = filterResults(data);
    console.log("Results", results);
    return (
        <table className="Qrcode-result-table bg-black">
            <thead>
                <tr>
                    <td>#</td>
                    <td>Decoded Text</td>
                    <td>Format</td>
                </tr>
            </thead>
            <tbody>
                {results.map((result, i) => (
                    <tr key={i}>
                        <td>{i}</td>
                        <td>{result.decodedText}</td>
                        <td>{result.result.format.formatName}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

// Define props for the plugin component.
interface ResultContainerPluginProps {
    results: Result[];
}

// Define the ResultContainerPlugin component that uses ResultContainerTable.
const ResultContainerPlugin: React.FC<ResultContainerPluginProps> = ({ results }) => {
    const filteredResults = filterResults(results);
    return (
        <div className="Result-container">
            <div className="Result-header">Scanned results ({filteredResults.length})</div>
            <div className="Result-section">
                <ResultContainerTable data={filteredResults} />
            </div>
        </div>
    );
};

export default ResultContainerPlugin;
