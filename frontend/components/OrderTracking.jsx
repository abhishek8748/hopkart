// src/components/OrderTracking.jsx
// Drop-in tracking widget. Pass an AWB and it shows the live status + scan history.
// Themed to BashaBos: blue #1a56db, red #e53e3e, Nunito.
//
// Usage:
//   import OrderTracking from "./components/OrderTracking";
//   <OrderTracking awb={order.awb} />

import { useEffect, useState } from "react";
import { trackShipment } from "../services/shippingApi";

const BLUE = "#1a56db";
const RED = "#e53e3e";

// Maps Bigship scan_status -> a 0..100 progress for the bar.
const STATUS_PROGRESS = {
  "Pickup Scheduled": 15,
  "Not Picked": 15,
  "In-Transit": 55,
  "Out for Delivery": 85,
  Delivered: 100,
  Undelivered: 85,
  "RTO In Transit": 60,
  "RTO Delivered": 100,
  Cancelled: 0,
  Lost: 0,
};

export default function OrderTracking({ awb, type = "awb" }) {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  useEffect(() => {
    let alive = true;
    if (!awb) return;
    setState({ loading: true, error: null, data: null });
    trackShipment(awb, type)
      .then((res) => alive && setState({ loading: false, error: null, data: res.data }))
      .catch((err) => alive && setState({ loading: false, error: err.message, data: null }));
    return () => {
      alive = false;
    };
  }, [awb, type]);

  if (!awb) return null;

  const wrap = {
    fontFamily: "Nunito, sans-serif",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 20,
    maxWidth: 520,
  };

  if (state.loading) return <div style={wrap}>Tracking your order…</div>;
  if (state.error)
    return (
      <div style={{ ...wrap, borderColor: RED, color: RED }}>
        Couldn't fetch tracking: {state.error}
      </div>
    );

  const detail = state.data?.order_detail || {};
  const history = state.data?.scan_histories || [];
  const progress = STATUS_PROGRESS[detail.current_tracking_status?.replace(/^\w/, (c) => c)] ??
    STATUS_PROGRESS[
      Object.keys(STATUS_PROGRESS).find(
        (k) => k.toLowerCase() === (detail.current_tracking_status || "").toLowerCase()
      )
    ] ??
    40;

  return (
    <div style={wrap}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <strong style={{ color: BLUE, fontSize: 18 }}>{detail.current_tracking_status || "Tracking"}</strong>
        <span style={{ color: "#6b7280", fontSize: 13 }}>{detail.courier_name}</span>
      </div>
      <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>AWB: {detail.tracking_id || awb}</div>

      <div style={{ background: "#eef2ff", borderRadius: 999, height: 8, marginTop: 16, overflow: "hidden" }}>
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${BLUE}, ${RED})`,
            transition: "width .4s ease",
          }}
        />
      </div>

      <div style={{ marginTop: 18 }}>
        {history.length === 0 ? (
          <div style={{ color: "#6b7280", fontSize: 14 }}>No scan updates yet.</div>
        ) : (
          history.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 12, paddingBottom: 14 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: i === 0 ? RED : BLUE,
                  marginTop: 5,
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.scan_status}</div>
                <div style={{ fontSize: 13, color: "#374151" }}>{s.scan_remarks}</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                  {s.scan_location} · {s.scan_datetime}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
