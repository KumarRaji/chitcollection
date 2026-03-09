import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './GroupTotalSheet.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function getNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatRupeesOrBlank(value) {
  const n = getNumber(value);
  return n === 0 ? '' : `₹${n}`;
}

function GroupTotalSheet({ group, members }) {
  const [paidByMemberId, setPaidByMemberId] = useState({});
  const [lastDateByMemberId, setLastDateByMemberId] = useState({});
  const [meta, setMeta] = useState({
    chitAmount: '',
    monthlyChitAmount: '',
    auctionWinnerName: '',
    delayedAmount: '',
    cashier: '',
    chitAmount2: '',
    date: '',
    month: ''
  });

  useEffect(() => {
    const groupId = group?.id;
    if (!groupId) return;

    const key = `groupTotalMeta:${groupId}`;
    const raw = sessionStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setMeta((prev) => ({
          ...prev,
          ...parsed
        }));
        return;
      } catch {
        // ignore
      }
    }

    // Defaults for new group view
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    setMeta((prev) => ({
      ...prev,
      date: `${dd}/${mm}/${yyyy}`,
      month: mm
    }));
  }, [group?.id]);

  useEffect(() => {
    const groupId = group?.id;
    if (!groupId) return;
    const key = `groupTotalMeta:${groupId}`;
    sessionStorage.setItem(key, JSON.stringify(meta));
  }, [group?.id, meta]);

  useEffect(() => {
    let isMounted = true;
    async function fetchTotals() {
      if (!group?.id) {
        if (isMounted) {
          setPaidByMemberId({});
          setLastDateByMemberId({});
        }
        return;
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/api/groups/${group.id}/collection-totals`);
        const map = {};
        const dateMap = {};
        for (const row of Array.isArray(res.data) ? res.data : []) {
          map[row.memberId] = getNumber(row.totalPaid);
          if (row.lastDate) dateMap[row.memberId] = row.lastDate;
        }
        if (isMounted) {
          setPaidByMemberId(map);
          setLastDateByMemberId(dateMap);
        }
      } catch (err) {
        if (isMounted) {
          setPaidByMemberId({});
          setLastDateByMemberId({});
        }
        // Non-fatal; keep UI usable even if totals endpoint fails
        console.error(err);
      }
    }
    fetchTotals();
    return () => {
      isMounted = false;
    };
  }, [group?.id]);

  const totalPaidAll = useMemo(() => {
    return (Array.isArray(members) ? members : []).reduce((sum, m) => {
      return sum + getNumber(paidByMemberId[m?.id]);
    }, 0);
  }, [members, paidByMemberId]);

  const totalBalanceAll = useMemo(() => {
    const totalAmount = (Array.isArray(members) ? members : []).reduce((sum, m) => {
      const amt = m?.chitAmount ?? m?.chit_amount ?? m?.amount ?? 0;
      return sum + getNumber(amt);
    }, 0);
    return Math.max(0, totalAmount - totalPaidAll);
  }, [members, totalPaidAll]);

  const summary = useMemo(() => {
    const totalMembers = Array.isArray(members) ? members.length : 0;
    const totalAmount = (Array.isArray(members) ? members : []).reduce((sum, m) => {
      const amt = m?.chitAmount ?? m?.chit_amount ?? m?.amount ?? 0;
      return sum + getNumber(amt);
    }, 0);

    return { totalMembers, totalAmount };
  }, [members]);

  const handlePrint = () => {
    try {
      document.body.classList.add('print-group-total');
      const cleanup = () => document.body.classList.remove('print-group-total');
      window.addEventListener('afterprint', cleanup, { once: true });
      window.print();
      setTimeout(cleanup, 500);
    } catch {
      window.print();
    }
  };

  const onMetaChange = (key) => (e) => {
    const value = e.target.value;
    setMeta((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="group-total-sheet">
      <div className="gts-header">
        <div className="gts-title">
          <div className="gts-title__main">{group?.name || 'Group'}</div>
          <div className="gts-title__sub">
            <span>Total உறுப்பினர்கள்: <strong>{summary.totalMembers}</strong></span>
            <span className="gts-dot">•</span>
            <span>மொத்த தொகை: <strong>₹{summary.totalAmount}</strong></span>
          </div>
        </div>
        <button onClick={handlePrint} className="btn-print">🖨️ Print</button>
      </div>

      <div className="gts-print-area">
        <div className="gts-paper-head">
          <div className="gts-paper-title">
            <div className="gts-paper-title-line">ஸ்ரீ ஐயப்பராஜன் துணை</div>
            <div className="gts-paper-title-line">ஸ்ரீ மேகேஸ்வரி அம்மன் துணை</div>
          </div>

          <div className="gts-paper-topmeta">
            <div className="gts-paper-topmeta-col">
              <div className="gts-paper-field">
                <span className="gts-paper-label">தேதி :</span>
                <input className="gts-paper-input" value={meta.date} onChange={onMetaChange('date')} />
              </div>
              <div className="gts-paper-field">
                <span className="gts-paper-label">மாதம் :</span>
                <input className="gts-paper-input" value={meta.month} onChange={onMetaChange('month')} />
              </div>
            </div>
            <div className="gts-paper-topmeta-col gts-paper-topmeta-col--right">
              <div className="gts-paper-field">
                <span className="gts-paper-label">சீட்டு தொகை :</span>
                <input className="gts-paper-input" value={meta.chitAmount} onChange={onMetaChange('chitAmount')} />
              </div>
              <div className="gts-paper-field">
                <span className="gts-paper-label">மாதம் சீட்டு தொகை :</span>
                <input className="gts-paper-input" value={meta.monthlyChitAmount} onChange={onMetaChange('monthlyChitAmount')} />
              </div>
            </div>
          </div>
        </div>

        <div className="gts-table-wrap">
          <table className="gts-table">
          <thead>
            <tr>
              <th className="gts-sno">வரி எண்</th>
              <th className="gts-name">பெயர் விவரம்</th>
              <th className="gts-amt">வரவு</th>
              <th className="gts-amt">பாக்கி</th>
              <th className="gts-date">தேதி</th>
              <th className="gts-phone">தொலைபேசி எண்</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(members) ? members : []).map((m, idx) => (
              <tr key={m.id ?? `${m.name}-${idx}`}>
                <td className="gts-sno">{idx + 1}</td>
                <td className="gts-name">
                  <div className="gts-name-main">{m?.name || ''}</div>
                  <div className="gts-name-sub">{m?.memberNumber ?? m?.member_number ?? ''}</div>
                </td>
                <td className="gts-amt">
                  {formatRupeesOrBlank(paidByMemberId[m?.id])}
                </td>
                <td className="gts-amt">
                  {formatRupeesOrBlank(
                    Math.max(
                      0,
                      getNumber(m?.chitAmount ?? m?.chit_amount) - getNumber(paidByMemberId[m?.id])
                    )
                  )}
                </td>
                <td className="gts-date">
                  {lastDateByMemberId[m?.id] ? new Date(lastDateByMemberId[m?.id]).toLocaleDateString() : ''}
                </td>
                <td className="gts-phone">{m?.phone ?? ''}</td>
              </tr>
            ))}

            {Array.from({ length: Math.max(0, 20 - (Array.isArray(members) ? members.length : 0)) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="gts-sno">{(Array.isArray(members) ? members.length : 0) + i + 1}</td>
                <td></td>
                <td className="gts-amt"></td>
                <td className="gts-amt"></td>
                <td className="gts-date"></td>
                <td className="gts-phone"></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="gts-total-label">மொத்தம்</td>
              <td className="gts-amt gts-total-amt">{formatRupeesOrBlank(totalPaidAll)}</td>
              <td className="gts-amt gts-total-amt">{formatRupeesOrBlank(totalBalanceAll)}</td>
              <td className="gts-date gts-total-amt"></td>
              <td className="gts-phone gts-total-amt"></td>
            </tr>
          </tfoot>
          </table>
        </div>

        <div className="gts-paper-footer">
          <div className="gts-paper-footer-left">
            <div className="gts-paper-field">
              <span className="gts-paper-label">ஏலம் எடுத்தவர் பெயர் :</span>
              <input className="gts-paper-input" value={meta.auctionWinnerName} onChange={onMetaChange('auctionWinnerName')} />
            </div>
            <div className="gts-paper-field">
              <span className="gts-paper-label">தள்ளி போன தொகை :</span>
              <input className="gts-paper-input" value={meta.delayedAmount} onChange={onMetaChange('delayedAmount')} />
            </div>
            <div className="gts-paper-field">
              <span className="gts-paper-label">கசிர் :</span>
              <input className="gts-paper-input" value={meta.cashier} onChange={onMetaChange('cashier')} />
            </div>
            <div className="gts-paper-field">
              <span className="gts-paper-label">சீட்டு தொகை :</span>
              <input className="gts-paper-input" value={meta.chitAmount2} onChange={onMetaChange('chitAmount2')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GroupTotalSheet;

