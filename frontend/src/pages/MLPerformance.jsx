import React from "react";

export default function MLPerformance() {
  const models = [
    {
      name: "Rule Engine",
      accuracy: 92.67,
      precision: 73.17,
      recall: 100.0,
      f1: 84.51,
    },
    {
      name: "Isolation Forest",
      accuracy: 80.0,
      precision: 50.0,
      recall: 100.0,
      f1: 66.67,
    },
    {
      name: "Hybrid Rule + ML",
      accuracy: 94.33,
      precision: 77.92,
      recall: 100.0,
      f1: 87.59,
    },
  ];

  return (
    <div className="ml-performance-page">
      <div className="page-header">
        <div>
          <h1>ML Performance</h1>
          <p>
            Evaluation of SentinelFlow's rule-based,
            Isolation Forest and hybrid detection models.
          </p>
        </div>

        <div className="live-badge">
          ● EVALUATED MODEL
        </div>
      </div>

      <div className="evaluation-banner">
        <strong>Evaluation Dataset</strong>
        <span>
          Synthetic labeled behavioral security benchmark
        </span>
        <span>700 training samples</span>
        <span>300 testing samples</span>
      </div>

      <div className="metric-grid">
        <Metric
          title="Best Accuracy"
          value="94.33%"
          subtitle="Hybrid Rule + ML"
        />

        <Metric
          title="Best Precision"
          value="77.92%"
          subtitle="Hybrid Rule + ML"
        />

        <Metric
          title="Recall"
          value="100%"
          subtitle="All evaluated models"
        />

        <Metric
          title="Best F1 Score"
          value="87.59%"
          subtitle="Hybrid Rule + ML"
        />
      </div>

      <section className="panel">
        <h2>Model Comparison</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>MODEL</th>
                <th>ACCURACY</th>
                <th>PRECISION</th>
                <th>RECALL</th>
                <th>F1 SCORE</th>
              </tr>
            </thead>

            <tbody>
              {models.map((model) => (
                <tr
                  key={model.name}
                  className={
                    model.name === "Hybrid Rule + ML"
                      ? "best-row"
                      : ""
                  }
                >
                  <td>
                    <strong>{model.name}</strong>
                  </td>

                  <td>{model.accuracy}%</td>
                  <td>{model.precision}%</td>
                  <td>{model.recall}%</td>
                  <td>
                    <strong>{model.f1}%</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="comparison-grid">
        <section className="panel">
          <h2>Confusion Matrices</h2>

          <Matrix
            title="Rule Engine"
            values={[
              [218, 22],
              [0, 60],
            ]}
          />

          <Matrix
            title="Isolation Forest"
            values={[
              [180, 60],
              [0, 60],
            ]}
          />

          <Matrix
            title="Hybrid Rule + ML"
            values={[
              [223, 17],
              [0, 60],
            ]}
          />
        </section>

        <section className="panel">
          <h2>Why Hybrid Detection?</h2>

          <div className="explanation">
            <div>
              <strong>Rule Engine</strong>
              <p>
                Detects known suspicious behaviours using
                explainable security policies.
              </p>
            </div>

            <div>
              <strong>Isolation Forest</strong>
              <p>
                Identifies behavioural anomalies that may
                not match predefined security rules.
              </p>
            </div>

            <div>
              <strong>Hybrid Model</strong>
              <p>
                Combines both signals to improve overall
                detection performance.
              </p>
            </div>

            <div className="result">
              <strong>Result</strong>
              <p>
                Hybrid detection achieved the highest
                F1 score of <b>87.59%</b> on the evaluation
                benchmark.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="panel">
        <h2>Detection Pipeline</h2>

        <div className="pipeline">
          <Step number="1" title="User Activity" />
          <Arrow />
          <Step number="2" title="Feature Engineering" />
          <Arrow />
          <Step number="3" title="Rule Engine" />
          <Arrow />
          <Step number="4" title="Isolation Forest" />
          <Arrow />
          <Step number="5" title="Hybrid Risk Score" />
          <Arrow />
          <Step number="6" title="Threat Alert" />
        </div>
      </section>

      <style>{`
        .ml-performance-page {
          padding: 30px;
          color: #e5e7eb;
          min-height: 100vh;
          background: #080d19;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        h1 {
          margin: 0;
          font-size: 32px;
        }

        h2 {
          margin-top: 0;
          margin-bottom: 20px;
        }

        .page-header p {
          color: #94a3b8;
          margin-top: 8px;
        }

        .live-badge {
          border: 1px solid #2563eb;
          color: #60a5fa;
          padding: 10px 15px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
        }

        .evaluation-banner {
          background: #0d2235;
          border: 1px solid #075985;
          border-radius: 10px;
          padding: 16px 20px;
          display: flex;
          gap: 25px;
          flex-wrap: wrap;
          margin-bottom: 25px;
        }

        .evaluation-banner span {
          color: #94a3b8;
        }

        .metric-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 25px;
        }

        .metric {
          background: #131d31;
          border: 1px solid #26344d;
          border-left: 4px solid #2563eb;
          border-radius: 12px;
          padding: 22px;
        }

        .metric-title {
          color: #94a3b8;
        }

        .metric-value {
          font-size: 30px;
          font-weight: 800;
          margin-top: 8px;
        }

        .metric-subtitle {
          color: #38bdf8;
          font-size: 12px;
          margin-top: 5px;
        }

        .panel {
          background: #131d31;
          border: 1px solid #26344d;
          border-radius: 12px;
          padding: 22px;
          margin-bottom: 25px;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 14px;
          color: #60a5fa;
          font-size: 11px;
          background: #080f1f;
        }

        td {
          padding: 16px 14px;
          border-bottom: 1px solid #26344d;
        }

        .best-row {
          background: #0d2235;
        }

        .best-row td:last-child {
          color: #22c55e;
        }

        .comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        .matrix {
          margin-bottom: 22px;
        }

        .matrix-title {
          margin-bottom: 8px;
          color: #93c5fd;
        }

        .matrix table {
          max-width: 300px;
        }

        .matrix td {
          text-align: center;
          background: #0d1628;
          border: 1px solid #334155;
          font-weight: 700;
        }

        .explanation > div {
          padding: 15px;
          border-bottom: 1px solid #26344d;
        }

        .explanation p {
          color: #94a3b8;
          line-height: 1.5;
          margin-bottom: 0;
        }

        .result {
          border: 1px solid #075985;
          background: #0d2235;
          border-radius: 8px;
          margin-top: 15px;
        }

        .pipeline {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .step {
          background: #0d1628;
          border: 1px solid #334155;
          border-radius: 10px;
          padding: 18px;
          min-width: 125px;
          text-align: center;
        }

        .step-number {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 8px;
          font-weight: 800;
        }

        .arrow {
          color: #3b82f6;
          font-size: 24px;
        }

        @media (max-width: 1000px) {
          .metric-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .comparison-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .metric-grid {
            grid-template-columns: 1fr;
          }

          .ml-performance-page {
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
}

function Metric({ title, value, subtitle }) {
  return (
    <div className="metric">
      <div className="metric-title">{title}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-subtitle">{subtitle}</div>
    </div>
  );
}

function Matrix({ title, values }) {
  return (
    <div className="matrix">
      <div className="matrix-title">
        <strong>{title}</strong>
      </div>

      <table>
        <tbody>
          <tr>
            <td>TN</td>
            <td>FP</td>
          </tr>

          <tr>
            <td>{values[0][0]}</td>
            <td>{values[0][1]}</td>
          </tr>

          <tr>
            <td>FN</td>
            <td>TP</td>
          </tr>

          <tr>
            <td>{values[1][0]}</td>
            <td>{values[1][1]}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Step({ number, title }) {
  return (
    <div className="step">
      <div className="step-number">{number}</div>
      <strong>{title}</strong>
    </div>
  );
}

function Arrow() {
  return <div className="arrow">→</div>;
}