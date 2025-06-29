
'use client';

import { sql } from '@vercel/postgres';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React, { useRef, useEffect, useState } from 'react';

interface WorkflowData {
    name: string;
    resume_count: number;
}

async function getAnalyticsData(): Promise<WorkflowData[]> {
    const { rows } = await sql`SELECT name, resume_count FROM workflows`;
    return rows as WorkflowData[];
}

const AnalyticsPage = () => {
    const [data, setData] = useState<WorkflowData[]>([]);
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getAnalyticsData().then(setData);
    }, []);

    const exportPdf = () => {
        if (chartRef.current) {
            html2canvas(chartRef.current).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF();
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save('analytics.pdf');
            });
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Analytics</h1>
                <button className="btn btn-primary" onClick={exportPdf}>Export to PDF</button>
            </div>
            <div ref={chartRef}>
                <div className="stats shadow">
                    <div className="stat">
                        <div className="stat-title">Total Resumes</div>
                        <div className="stat-value">{data.reduce((acc, item) => acc + item.resume_count, 0)}</div>
                    </div>
                </div>
                <div className="mt-8" style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="resume_count" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
