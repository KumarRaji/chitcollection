import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './CollectionSheet.css';

function CollectionSheet({ member }) {
  const [collections, setCollections] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCollection, setNewCollection] = useState({
    collection_date: '',
    due_date: '',
    amount: '',
    notes: ''
  });

  const handlePrint = () => {
    window.print();
  };

  const fetchCollections = useCallback(async () => {
    try {
      const res = await axios.get(`/api/collections/${member.id}`);
      setCollections(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [member.id]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleAddCollection = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/collections', {
        member_id: member.id,
        ...newCollection,
        status: 'paid'
      });
      setNewCollection({ collection_date: '', due_date: '', amount: '', notes: '' });
      fetchCollections();
      setShowAddForm(false);
    } catch (err) {
      alert('Error adding collection');
    }
  };

  const splitAddress = (address) => {
    if (!address) return ['', ''];
    const maxLength = 30;
    if (address.length <= maxLength) return [address, ''];
    const splitIndex = address.lastIndexOf(' ', maxLength);
    return splitIndex > 0 
      ? [address.substring(0, splitIndex), address.substring(splitIndex + 1)]
      : [address.substring(0, maxLength), address.substring(maxLength)];
  };

  const [addressLine1, addressLine2] = splitAddress(member.address);

  const handleWhatsAppShare = async () => {
    try {
      const element = document.querySelector('.collection-sheet');
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `${member.name}_collection_sheet.pdf`, { type: 'application/pdf' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Collection Sheet - ${member.name}`,
          text: `Amount Paid for ${member.name}`
        });
      } else {
        pdf.save(`${member.name}_collection_sheet.pdf`);
        window.open(`https://wa.me/91${member.phone}`, '_blank');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      alert('Error generating PDF');
    }
  };

  return (
    <>
      <div className="collection-sheet">
        <div className="sheet-header">
          <div className="header-top">
            <div className="member-info-grid">
              <span className="label">பெயர்:</span>
              <span className="value">{member.name}</span>
              <span className="label">எண்:</span>
              <span className="value">{member.memberNumber}</span>
              
              <span className="label">தொலைபேசி எண்:</span>
              <span className="value">
                {member.phone}
                {member.phone && (
                  <a 
                    href={`https://wa.me/91${member.phone}?text=Amount%20paid%20for%20${encodeURIComponent(member.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-icon"
                    title="Send via WhatsApp"
                  >
                    📱
                  </a>
                )}
              </span>
              <span className="label">தொகை:</span>
              <span className="value">₹{member.chitAmount}</span>
              
              <span className="label">தந்தை பெயர்:</span>
              <span className="value">{member.fatherName}</span>
              <span className="label">ஆரம்ப தேதி:</span>
              <span className="value">{new Date(member.startDate).toLocaleDateString()}</span>
              
              <span className="label">விலாசம்:</span>
              <span className="value">{addressLine1}</span>
              <span className="label">ஆதார்:</span>
              <span className="value">{member.aadhaar}</span>
              
              <span className="label"></span>
              <span className="value address-extra">{addressLine2}</span>
              <span className="label">முடிவு தேதி:</span>
              <span className="value">{new Date(member.dueDate).toLocaleDateString()}</span>
            </div>
            {member.photoUrl && (
              <div className="member-photo">
                <div className="photo-logo">
                  <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" className="logo-image" crossOrigin="anonymous" />
                </div>
                <img src={`http://localhost:5000${member.photoUrl}`} alt={member.name} crossOrigin="anonymous" />
              </div>
            )}
          </div>
        </div>

        <div className="collections-section">
          <div className="section-header">
            <h3>Collection Records</h3>
            <div className="action-buttons">
              <button onClick={handleWhatsAppShare} className="btn-whatsapp">
                📱 Share with WhatsApp
              </button>
              <button onClick={handlePrint} className="btn-print">
                🖨️ Print
              </button>
              <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
                {showAddForm ? 'Cancel' : 'Add Collection'}
              </button>
            </div>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddCollection} className="add-collection-form">
              <input
                type="date"
                value={newCollection.collection_date}
                onChange={(e) => setNewCollection({...newCollection, collection_date: e.target.value})}
                required
              />
              <input
                type="date"
                value={newCollection.due_date}
                onChange={(e) => setNewCollection({...newCollection, due_date: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="Amount"
                value={newCollection.amount}
                onChange={(e) => setNewCollection({...newCollection, amount: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Notes"
                value={newCollection.notes}
                onChange={(e) => setNewCollection({...newCollection, notes: e.target.value})}
              />
              <button type="submit" className="btn-primary">Save</button>
            </form>
          )}

          <table className="collection-table">
            <thead>
              <tr>
                <th>எண்</th>
                <th>தவணை தேதி</th>
                <th>வரவு தேதி</th>
                <th>வரவு</th>
                <th>பாக்கி</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((col, idx) => (
                <tr key={col.id}>
                  <td>{idx + 1}</td>
                  <td>{new Date(col.collectionDate).toLocaleDateString()}</td>
                  <td>{new Date(col.dueDate).toLocaleDateString()}</td>
                  <td>₹{col.amount}</td>
                  <td>{col.notes}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 12 - collections.length) }).map((_, idx) => (
                <tr key={`empty-${idx}`}>
                  <td>{collections.length + idx + 1}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
              <tr className="extra-row">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr className="extra-row">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="print-sheet" aria-hidden="true">
        <div className="print-sheet__inner">
          <div className="print-title">Cash Collection Sheet</div>

          <div className="print-header">
            <table className="print-header-table">
              <tbody>
                <tr>
                  <td className="ph-label">பெயர்:</td>
                  <td className="ph-value">{member.name}</td>
                  <td className="ph-label">எண்:</td>
                  <td className="ph-value">{member.memberNumber}</td>
                  <td className="ph-photo" rowSpan={5}>
                    <div className="ph-logo">
                      <img
                        src={`${process.env.PUBLIC_URL}/logo.png`}
                        alt="Logo"
                        className="ph-logo-image"
                        crossOrigin="anonymous"
                      />
                    </div>
                    {member.photoUrl ? (
                      <img
                        src={`http://localhost:5000${member.photoUrl}`}
                        alt={member.name}
                        className="ph-photo-image"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="ph-photo-placeholder">Photo</div>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="ph-label">தொலைபேசி எண்:</td>
                  <td className="ph-value">{member.phone}</td>
                  <td className="ph-label">தொகை:</td>
                  <td className="ph-value">₹{member.chitAmount}</td>
                </tr>
                <tr>
                  <td className="ph-label">தந்தை பெயர்:</td>
                  <td className="ph-value">{member.fatherName}</td>
                  <td className="ph-label">ஆரம்ப தேதி:</td>
                  <td className="ph-value">{new Date(member.startDate).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td className="ph-label">விலாசம்:</td>
                  <td className="ph-value">{addressLine1}</td>
                  <td className="ph-label">ஆதார்:</td>
                  <td className="ph-value">{member.aadhaar}</td>
                </tr>
                <tr>
                  <td className="ph-label"></td>
                  <td className="ph-value">{addressLine2}</td>
                  <td className="ph-label">முடிவு தேதி:</td>
                  <td className="ph-value">{new Date(member.dueDate).toLocaleDateString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <table className="print-table">
            <thead>
              <tr>
                <th className="pt-sno">எண்</th>
                <th>தவணை தேதி</th>
                <th>வரவு தேதி</th>
                <th className="pt-amt">வரவு</th>
                <th>பாக்கி</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((col, idx) => (
                <tr key={`p-${col.id}`}>
                  <td className="pt-sno">{idx + 1}</td>
                  <td>{new Date(col.collectionDate).toLocaleDateString()}</td>
                  <td>{new Date(col.dueDate).toLocaleDateString()}</td>
                  <td className="pt-amt">₹{col.amount}</td>
                  <td>{col.notes}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 12 - collections.length) }).map((_, idx) => (
                <tr key={`p-empty-${idx}`}>
                  <td className="pt-sno">{collections.length + idx + 1}</td>
                  <td></td>
                  <td></td>
                  <td className="pt-amt"></td>
                  <td></td>
                </tr>
              ))}
              <tr className="pt-extra-row">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr className="pt-extra-row">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default CollectionSheet;
