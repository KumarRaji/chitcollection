import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MemberForm from './components/MemberForm';
import CollectionSheet from './components/CollectionSheet';
import GroupForm from './components/GroupForm';
import './App.css';

function App() {
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await axios.get('/api/groups');
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMembersByGroup = async (groupId) => {
    try {
      const res = await axios.get(`/api/groups/${groupId}/members`);
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setSelectedMember(null);
    fetchMembersByGroup(group.id);
  };

  const handleMemberCreated = () => {
    setShowMemberForm(false);
    fetchGroups();
    if (selectedGroup) {
      fetchMembersByGroup(selectedGroup.id);
    }
  };

  const handleGroupCreated = () => {
    fetchGroups();
    setShowGroupForm(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Chit Collection Management</h1>
        <div>
          <button onClick={() => setShowGroupForm(!showGroupForm)} className="btn-primary" style={{marginRight: '10px'}}>
            {showGroupForm ? 'Cancel' : 'Add Group'}
          </button>
          <button onClick={() => setShowMemberForm(!showMemberForm)} className="btn-primary">
            {showMemberForm ? 'Cancel' : 'Add Member'}
          </button>
        </div>
      </header>

      {showGroupForm && <GroupForm onSuccess={handleGroupCreated} onCancel={() => setShowGroupForm(false)} />}
      {showMemberForm && <MemberForm onSuccess={handleMemberCreated} selectedGroup={selectedGroup} onCancel={() => setShowMemberForm(false)} />}

      <div className="content">
        <div className="sidebar">
          <h2>Groups</h2>
          {groups.map(group => (
            <div
              key={group.id}
              className={`group-item ${selectedGroup?.id === group.id ? 'active' : ''}`}
              onClick={() => handleGroupSelect(group)}
            >
              <strong>{group.name}</strong>
              <small>{group._count?.members || 0} members</small>
            </div>
          ))}

          {selectedGroup && (
            <>
              <h3 style={{marginTop: '20px'}}>Members</h3>
              {members.map(member => (
                <div
                  key={member.id}
                  className={`member-item ${selectedMember?.id === member.id ? 'active' : ''}`}
                  onClick={() => setSelectedMember(member)}
                >
                  <strong>{member.name}</strong>
                  <small>{member.memberNumber}</small>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="main-content">
          {selectedMember ? (
            <CollectionSheet member={selectedMember} />
          ) : (
            <div className="placeholder">Select a group and member to view collection sheet</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
