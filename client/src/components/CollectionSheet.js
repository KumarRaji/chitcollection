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
        <div className="member-info">
          <h2>{member.name}</h2>
          <p>Member No: {member.memberNumber}</p>
          <p>Phone: {member.phone}</p>
          <p>Aadhaar: {member.aadhaar}</p>
          <p>Address: {member.address}</p>
          <p>Chit Amount: ₹{member.chitAmount}</p>
          <p>Start Date: {new Date(member.startDate).toLocaleDateString()}</p>
          <p>Due Date: {new Date(member.dueDate).toLocaleDateString()}</p>
        </div>
        {member.photoUrl && (
          <div className="member-photo">
            <img src={`http://localhost:5000${member.photoUrl}`} alt={member.name} />
          </div>
        )}
      </div>

      <div className="collections-section">
        <div className="section-header">
          <h3>Collection Records</h3>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
            {showAddForm ? 'Cancel' : 'Add Collection'}
          </button>
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
              <th>No</th>
              <th>Collection Date</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Notes</th>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CollectionSheet;
