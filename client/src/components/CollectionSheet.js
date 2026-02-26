import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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

  return (
    <div className="collection-sheet">
      <div className="sheet-header">
        <div className="header-top">
          <div className="member-info-grid">
            <span className="label">பெயர்:</span>
            <span className="value">{member.name}</span>
            <span className="label">எண்:</span>
            <span className="value">{member.memberNumber}</span>
            
            <span className="label">தொலைபேசி எண்:</span>
            <span className="value">{member.phone}</span>
            <span className="label">தொகை:</span>
            <span className="value">₹{member.chitAmount}</span>
            
            <span className="label">தந்தை பெயர்:</span>
            <span className="value"></span>
            <span className="label">ஆரம்ப தேதி:</span>
            <span className="value">{new Date(member.startDate).toLocaleDateString()}</span>
            
            <span className="label">விலாசம்:</span>
            <span className="value">{member.address}</span>
            <span className="label">ஆதார்:</span>
            <span className="value">{member.aadhaar}</span>
            
            <span className="label"></span>
            <span className="value address-extra"></span>
            <span className="label">முடிவு தேதி:</span>
            <span className="value">{new Date(member.dueDate).toLocaleDateString()}</span>
          </div>
          {member.photoUrl && (
            <div className="member-photo">
              <div className="photo-logo">
                <img src="/logo.png" alt="Logo" className="logo-image" />
              </div>
              <img src={`http://localhost:5000${member.photoUrl}`} alt={member.name} />
            </div>
          )}
        </div>
      </div>

      <div className="collections-section">
        <div className="section-header">
          <h3>Collection Records</h3>
          <div className="action-buttons">
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
  );
}

export default CollectionSheet;
