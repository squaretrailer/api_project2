// ==================== DEFAULT DATA ====================
const defaultMembers = [
    { id: 1, name: "Pain", image: "images/pain.jpg", description: "Leader of Akatsuki, wielder of the Rinnegan." },
    { id: 2, name: "Itachi Uchiha", image: "images/itachi uchiha.jpg", description: "Former ANBU captain, sacrificed everything for peace." },
    { id: 3, name: "Kisame Hoshigaki", image: "images/Kisame.webp", description: "The tailless tailed beast, wielder of Samehada." },
    { id: 4, name: "Konan", image: "images/Konan.webp", description: "The angel of Amegakure, master of origami." },
    { id: 5, name: "Sasori", image: "images/sasori.jpg", description: "Puppet master who turned himself into a puppet." },
    { id: 6, name: "Orochimaru", image: "images/orochimaru.jpg", description: "Ambitious rogue scientist seeking immortality." },
    { id: 7, name: "Deidara", image: "images/Diedara.jpg", description: "Explosive artist, believes art is a bang." },
    { id: 8, name: "Kakuzu", image: "images/kakuzu.jpg", description: "Greedy treasurer with five hearts." },
    { id: 9, name: "Hidan", image: "images/hidan.png", description: "Immortal cultist of Jashin." },
    { id: 10, name: "Zetsu", image: "images/zetsu.webp", description: "Spore-like spy, black and white halves." },
    { id: 11, name: "Obito Uchiha", image: "images/obito uchiha.jpg", description: "The masked man behind the Fourth Great Ninja War." },
    { id: 12, name: "Madara Uchiha", image: "images/madara uchiha.jpg", description: "Legendary ghost of the Uchiha, founder of Akatsuki's roots." }
];

const defaultQuotes = [
    { id: 1, memberId: 1, quote: "Pain is the best teacher. No one grows without pain." },
    { id: 2, memberId: 1, quote: "Wake up to reality! Nothing ever goes as planned." },
    { id: 3, memberId: 2, quote: "It is not foolish to forgive. But to forgive without facing reality is foolish." },
    { id: 4, memberId: 2, quote: "People live their lives bound by what they accept as correct and true." },
    { id: 5, memberId: 3, quote: "I will not die alone. I'll take you with me." },
    { id: 6, memberId: 7, quote: "Art is an explosion!" },
    { id: 7, memberId: 8, quote: "Money is the thing that never betrays me." },
    { id: 8, memberId: 9, quote: "Jashin-sama, I offer you this sacrifice!" },
    { id: 9, memberId: 6, quote: "I want to learn all the jutsu in the world and become immortal." },
    { id: 10, memberId: 11, quote: "Those who abandon their friends are worse than trash." },
    { id: 11, memberId: 12, quote: "Wake up to reality! Nothing ever goes as planned in this accursed world." }
];

// ==================== localStorage ====================
function initStorage() {
    if (!localStorage.getItem("akatsuki_members")) {
        localStorage.setItem("akatsuki_members", JSON.stringify(defaultMembers));
    }
    if (!localStorage.getItem("akatsuki_quotes")) {
        localStorage.setItem("akatsuki_quotes", JSON.stringify(defaultQuotes));
    }
}
initStorage();

function getMembers() {
    return JSON.parse(localStorage.getItem("akatsuki_members"));
}
function saveMembers(members) {
    localStorage.setItem("akatsuki_members", JSON.stringify(members));
}
function getQuotes() {
    return JSON.parse(localStorage.getItem("akatsuki_quotes"));
}
function saveQuotes(quotes) {
    localStorage.setItem("akatsuki_quotes", JSON.stringify(quotes));
}

// ==================== REST API (HTTP VERBS) ====================
const AkatsukiAPI = {
    // ---------- MEMBERS ----------
    // GET all members
    getMembers: () => Promise.resolve(getMembers()),
    // GET member by id
    getMember: (id) => {
        const member = getMembers().find(m => m.id === id);
        return member ? Promise.resolve(member) : Promise.reject({ status: 404, message: "Member not found" });
    },
    // POST new member
    postMember: (name, image, description) => {
        const members = getMembers();
        const newId = members.length ? Math.max(...members.map(m => m.id)) + 1 : 13;
        const newMember = { id: newId, name, image, description };
        members.push(newMember);
        saveMembers(members);
        return Promise.resolve(newMember);
    },
    // PATCH member (partial update)
    patchMember: (id, updates) => {
        const members = getMembers();
        const index = members.findIndex(m => m.id === id);
        if (index === -1) return Promise.reject({ status: 404, message: "Member not found" });
        members[index] = { ...members[index], ...updates };
        saveMembers(members);
        return Promise.resolve(members[index]);
    },
    // DELETE member
    deleteMember: (id) => {
        let members = getMembers();
        const exists = members.some(m => m.id === id);
        if (!exists) return Promise.reject({ status: 404, message: "Member not found" });
        members = members.filter(m => m.id !== id);
        saveMembers(members);
        return Promise.resolve({ success: true, id });
    },

    // ---------- QUOTES ----------
    getQuotes: () => Promise.resolve(getQuotes()),
    getQuotesByMember: (memberId) => {
        const filtered = getQuotes().filter(q => q.memberId === memberId);
        return filtered.length ? Promise.resolve(filtered) : Promise.reject({ status: 404, message: "No quotes for this member" });
    },
    postQuote: (memberId, quoteText) => {
        const quotes = getQuotes();
        const newId = Date.now();
        const newQuote = { id: newId, memberId, quote: quoteText };
        quotes.push(newQuote);
        saveQuotes(quotes);
        return Promise.resolve(newQuote);
    },
    deleteQuote: (id) => {
        let quotes = getQuotes();
        const exists = quotes.some(q => q.id === id);
        if (!exists) return Promise.reject({ status: 404, message: "Quote not found" });
        quotes = quotes.filter(q => q.id !== id);
        saveQuotes(quotes);
        return Promise.resolve({ success: true, id });
    }
};

window.AkatsukiAPI = AkatsukiAPI;

// ==================== DYNAMIC UI RENDERING ====================
function renderMemberList() {
    AkatsukiAPI.getMembers().then(members => {
        const container = document.querySelector('.card-images ul');
        if (!container) return;
        container.innerHTML = '';
        members.forEach(member => {
            const li = document.createElement('li');
            li.style.position = 'relative';
            li.innerHTML = `
                <img src="${member.image}" alt="${member.name}">
                <span>${member.name}</span>
                <button class="delete-member" data-id="${member.id}" title="Delete member">✖</button>
                <button class="edit-member" data-id="${member.id}" title="Edit member">✏️</button>
            `;
            container.appendChild(li);
        });
        // Delete buttons
        document.querySelectorAll('.delete-member').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                if (confirm('Remove this member?')) {
                    AkatsukiAPI.deleteMember(id)
                        .then(() => {
                            alert('Member deleted');
                            renderMemberList();
                        })
                        .catch(err => alert(err.message || 'Error'));
                }
            });
        });
        // Edit buttons (PATCH)
        document.querySelectorAll('.edit-member').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                try {
                    const member = await AkatsukiAPI.getMember(id);
                    const newName = prompt('Edit name:', member.name);
                    if (newName && newName !== member.name) {
                        await AkatsukiAPI.patchMember(id, { name: newName });
                        renderMemberList();
                    }
                } catch (err) { alert(err.message); }
            });
        });
    });
}

// ==================== ADD MEMBER FORM ====================
const addFormHtml = `
    <div class="add-member-section">
        <h3>Add a New Akatsuki Member</h3>
        <form id="addMemberForm" class="add-member-form">
            <input type="text" id="memberName" placeholder="Member Name" required>
            <input type="text" id="memberImage" placeholder="Image Path (e.g., images/new.jpg)" required>
            <textarea id="memberDesc" placeholder="Description" rows="2" required></textarea>
            <button type="submit">Add Member (POST)</button>
        </form>
    </div>
`;

const aboutSection = document.querySelector('.About');
if (aboutSection && !document.querySelector('.add-member-section')) {
    aboutSection.insertAdjacentHTML('afterend', addFormHtml);
}

document.addEventListener('submit', (e) => {
    if (e.target && e.target.id === 'addMemberForm') {
        e.preventDefault();
        const name = document.getElementById('memberName').value.trim();
        const image = document.getElementById('memberImage').value.trim();
        const description = document.getElementById('memberDesc').value.trim();
        if (!name || !image || !description) {
            alert('Please fill all fields');
            return;
        }
        AkatsukiAPI.postMember(name, image, description)
            .then(() => {
                alert('Member added (POST request)');
                e.target.reset();
                renderMemberList();
            })
            .catch(err => alert(err.message || 'Error'));
    }
});

// ==================== INITIAL RENDER ====================
renderMemberList();

console.log('AkatsukiAPI ready. Use AkatsukiAPI.getMembers(), .postMember(), .patchMember(), .deleteMember() etc.');