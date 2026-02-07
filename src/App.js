import React, { useState, useRef, useEffect } from 'react';
// Added Camera and Search icons
import { FileText, Clock, CheckCircle, Mail, Phone, Building, Send, Menu, X, Home, Bell, Shield, MessageSquare, Bot, XCircle, ArrowRight, Lock, LogOut, LayoutDashboard, User, Camera, Search } from 'lucide-react';
// Added Scanner import
import { Scanner } from '@yudiel/react-qr-scanner';


const PUPRegistrarPortal = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [qrImage, setQrImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date().toLocaleDateString('en-CA');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showReview, setShowReview] = useState(false);
 
  // --- ADMIN STATE ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminData, setAdminData] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, completed: 0,  pickup: 0, rejected: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;


  // --- NEW: SCANNER & SEARCH STATE ---
  const [showScanner, setShowScanner] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');


  // --- CHATBOT STATE ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello, Iskolar! 👋 I am PUP-Assist. You can ask me about fees, requirements, or processing times.' }
  ]);
  const messagesEndRef = useRef(null);


  // --- TRACKING STATE ---
  const [searchRef, setSearchRef] = useState('');
  const [trackResult, setTrackResult] = useState(null);


  const [formData, setFormData] = useState({
    fullName: '',
    studentNumber: '',
    email: '',
    college: '',
    program: '',
    phone: '',
    serviceCategory: '',
    specificService: '',
    purpose: '',
    isUrgent: '',
    urgencyDeadline: ''
  });


  // --- FULL DATA MAPPING ---
  const collegeData = {
    "College of Accountancy and Finance (CAF)": [
      "Bachelor of Science in Accountancy (BSA)",
      "Bachelor of Science in Business Administration Major in Financial Management (BSBAFM)",
      "Bachelor of Science in Management Accounting (BSMA)"
    ],
    "College of Architecture, Design and the Built Environment (CADBE)": [
      "Bachelor of Science in Architecture (BS-ARCH)",
      "Bachelor of Science in Interior Design (BSID)",
      "Bachelor of Science in Environmental Planning (BSEP)"
    ],
    "College of Arts and Letters (CAL)": [
      "Bachelor of Arts in English Language Studies (ABELS)",
      "Bachelor of Arts in Filipinology (ABF)",
      "Bachelor of Arts in Literary and Cultural Studies (ABLCS)",
      "Bachelor of Arts in Philosophy (AB-PHILO)",
      "Bachelor of Performing Arts major in Theater Arts (BPEA)"
    ],
    "College of Business Administration (CBA)": [
      "Bachelor of Science in Business Administration major in Human Resource Management (BSBAHRM)",
      "Bachelor of Science in Business Administration major in Marketing Management (BSBA-MM)",
      "Bachelor of Science in Entrepreneurship (BSENTREP)",
      "Bachelor of Science in Office Administration (BSOA)"
    ],
    "College of Communication (COC)": [
      "Bachelor in Advertising and Public Relations (BADPR)",
      "Bachelor of Arts in Broadcasting (BA Broadcasting)",
      "Bachelor of Arts in Communication Research (BACR)",
      "Bachelor of Arts in Journalism (BAJ)"
    ],
    "College of Computer and Information Sciences (CCIS)": [
      "Bachelor of Science in Computer Science (BSCS)",
      "Bachelor of Science in Information Technology (BSIT)"
    ],
    "College of Education (COED)": [
      "Bachelor of Technology and Livelihood Education (BTLEd) major in Home Economics",
      "Bachelor of Technology and Livelihood Education (BTLEd) major in Industrial Arts",
      "Bachelor of Technology and Livelihood Education (BTLEd) major in ICT",
      "Bachelor of Library and Information Science (BLIS)",
      "Bachelor of Secondary Education (BSEd) major in English",
      "Bachelor of Secondary Education (BSEd) major in Mathematics",
      "Bachelor of Secondary Education (BSEd) major in Filipino",
      "Bachelor of Secondary Education (BSEd) major in Social Studies",
      "Bachelor of Elementary Education (BEED)",
      "Bachelor of Early Childhood Education (BECED)"
    ],
    "College of Engineering (CE)": [
      "Bachelor of Science in Civil Engineering (BSCE)",
      "Bachelor of Science in Computer Engineering (BSCpE)",
      "Bachelor of Science in Electrical Engineering (BSEE)",
      "Bachelor of Science in Electronics Engineering (BSECE)",
      "Bachelor of Science in Industrial Engineering (BSIE)",
      "Bachelor of Science in Mechanical Engineering (BSME)",
      "Bachelor of Science in Railway Engineering (BSRE)"
    ],
    "College of Human Kinetics (CHK)": [
      "Bachelor of Physical Education (BPE)",
      "Bachelor of Science in Exercises and Sports (BSESS)"
    ],
    "College of Law (CL)": [
      "Juris Doctor (JD)"
    ],
    "College of Political Science and Public Administration (CPSPA)": [
      "Bachelor of Arts in Political Science (BAPS)",
      "Bachelor of Arts in Political Economy (BAPE)",
      "Bachelor of Arts in International Studies (BAIS)",
      "Bachelor of Public Administration (BPA)"
    ],
    "College of Social Sciences and Development (CSSD)": [
      "Bachelor of Arts in History (BAH)",
      "Bachelor of Arts in Sociology (BAS)",
      "Bachelor of Science in Cooperatives (BSC)",
      "Bachelor of Science in Economics (BSE)",
      "Bachelor of Science in Psychology (BSPSY)"
    ],
    "College of Science (CS)": [
      "Bachelor of Science Food Technology (BSFT)",
      "Bachelor of Science in Applied Mathematics (BSAPMATH)",
      "Bachelor of Science in Biology (BSBIO)",
      "Bachelor of Science in Chemistry (BSCHEM)",
      "Bachelor of Science in Mathematics (BSMATH)",
      "Bachelor of Science in Nutrition and Dietetics (BSND)",
      "Bachelor of Science in Physics (BSPHY)",
      "Bachelor of Science in Statistics (BSSTAT)"
    ],
    "College of Tourism, Hospitality and Transportation Management (CTHTM)": [
      "Bachelor of Science in Hospitality Management (BSHM)",
      "Bachelor of Science in Tourism Management (BSTM)",
      "Bachelor of Science in Transportation Management (BSTRM)"
    ],
    "Institute of Technology (ITECH)": [
      "Diploma in Computer Engineering Technology (DCET)",
      "Diploma in Electrical Engineering Technology (DEET)",
      "Diploma in Electronics Engineering Technology (DECET)",
      "Diploma in Information Communication Technology (DICT)",
      "Diploma in Mechanical Engineering Technology (DMET)",
      "Diploma in Office Management (DOMT)"
    ]
  };


  const serviceMapping = {
    "1. Academic Records / Information": [
      "Transcript of Records (TOR)",
      "Diploma",
      "Course Description",
      "Other"
    ],
    "2. Certifications - Original Issuance": [
      "Certificate of Graduation",
      "Certificate of Grades",
      "Certificate of Enrollment / Registration",
      "Certificate of General Weighted Average (GWA)",
      "Certificate of Units Earned",
      "Certificate of Graduation with Honors/Ranking",
      "Other"
    ],
    "3. Transfer & Clearance Documents": [
      "Honorable Dismissal",
      "Transfer Credentials",
      "Certificate of No Pending Disciplinary Case",
      "Other"
    ],
    "4. Authentication & Verification": [
      "CAV - Diploma",
      "CAV - Transcript of Records (TOR)",
      "CTC - Diploma",
      "CTC - Transcript of Records (TOR)",
      "CTC - Course Description",
      "Other"
    ],
    "5. Special Academic Processes": [
      "Completion of Incomplete Grade (INC)",
      "Correction of Name / Civil Status",
      "Accreditation of Subjects",
      "Application for Graduation",
      "Application for Shifting",
      "Application for Readmission",
      "Application for Leave of Absence (LOA)",
      "Permit to Cross-Enroll",
      "Withdrawal of Enrollment"
    ]
  };


  // --- CHATBOT INTELLIGENCE ---
  const infoDatabase = {
    tor: {
      keywords: ['tor', 'transcript', 'records'],
      response: "📄 **Transcript of Records (TOR)**\n• Fee: ₱100.00 per page + ₱30.00 Doc Stamp\n• Processing: 15–20 working days\n• Note: Clearance is usually required."
    },
    diploma: {
      keywords: ['diploma'],
      response: "🎓 **Diploma**\n• Fee: ₱150.00 (Certified True Copy) / ₱500+ (Duplicate)\n• Processing: 15–20 working days for duplicates; 3–5 days for CTC."
    },
    certifications: {
      keywords: ['certificate', 'grades', 'gwa', 'enrollment', 'registration', 'units'],
      response: "📝 **Certifications** (Grades, GWA, Enrollment, etc.)\n• Fee: ₱150.00 per copy\n• Processing: 3–7 working days."
    },
    honorable: {
      keywords: ['honorable', 'dismissal', 'transfer', 'credential'],
      response: "👋 **Honorable Dismissal**\n• Fee: ~₱150.00\n• Processing: 15 working days\n• Requirement: University Clearance is strictly required."
    },
    authentication: {
      keywords: ['cav', 'authentication', 'red ribbon', 'dfa'],
      response: "🏵️ **CAV / Authentication**\n• Fee: Varies (often bundled with TOR fee)\n• Processing: Additional 7–10 working days on top of document processing."
    },
    office: {
      keywords: ['office', 'hours', 'open', 'close', 'schedule'],
      response: "🕒 **Office Hours**\nMonday to Friday\n8:00 AM – 5:00 PM\n(Closed on Weekends and Holidays)"
    },
    payment: {
      keywords: ['pay', 'payment', 'fee', 'cashier'],
      response: "💰 **Payment Info**\nAll payments are made at the Cashier's Office (South Wing). You must secure an Order of Payment from the Registrar first."
    }
  };


  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleCollegeChange = (e) => {
    setFormData(prev => ({
      ...prev,
      college: e.target.value,
      program: '' // Reset program when college changes
    }));
  };


  const handleServiceChange = (e) => {
    setFormData(prev => ({
      ...prev,
      serviceCategory: e.target.value,
      specificService: '' // Reset specific service when category changes
    }));
  };


  // --- ADMIN FUNCTIONS ---
const handleAdminLogin = (e) => {
  e.preventDefault();
  if (adminUser === 'admin' && adminPass === 'admin123') {
    setIsAdminLoggedIn(true);
    setAdminUser('');
    setAdminPass('');
    fetchAdminData();
  } else {
    alert("Invalid Admin Credentials");
  }
};


  const fetchAdminData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/requests');
      const data = await response.json();
      setAdminData(data);
     
      // Calculate Stats
      const newStats = {
        total: data.length,
        pending: data.filter(r => r.status === 'Pending').length,
        processing: data.filter(r => r.status === 'Processing').length,
        completed: data.filter(r => r.status === 'Completed').length,
        pickup: data.filter(r => r.status === 'For Pickup').length,
        rejected: data.filter(r => r.status === 'Rejected').length
      };
      setStats(newStats);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };


  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
     
      if (response.ok) {
        fetchAdminData(); // Refresh table
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };


  // --- NEW: QR SCANNER HANDLER ---
  const handleScan = (result) => {
      if (result && result[0] && result[0].rawValue) {
          setAdminSearch(result[0].rawValue);
          setShowScanner(false);
          alert(`QR Detected: ${result[0].rawValue}`);
      }
  };


  // --- USER TRACKING ---
  const handleTrack = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/track/${searchRef}`);
      const data = await response.json();
     
      if (data.status === "Not Found") {
        setTrackResult({ status: 'Not Found', step: 0 });
      } else {
        setTrackResult(data);
      }
    } catch (error) {
      console.error("Tracking error:", error);
      setTrackResult({ status: 'Error', step: 0 });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
   
    // 1. Basic Safety Checks
    if (!privacyAccepted || isSubmitting) return;


    // 2. Validation: Name (Allows dots for Jr./Sr., commas, and hyphens)
    const nameRegex = /^[a-zA-Z\s,.'-]+$/;
    if (!nameRegex.test(formData.fullName)) {
        alert("Invalid Name: Please use only letters, dots (for Jr./Sr.), and commas.");
        return;
    }


    // 3. Validation: Student Number (Must have hyphens)
    if (!formData.studentNumber.includes('-')) {
        alert("Please enter a valid Student Number (e.g., 20XX-XXXXX-MN-X)");
        return;
    }


    // 4. Validation: Email
    if (!formData.email.includes('@')) {
        alert("Please enter a valid email address.");
        return;
    }


    // Lock the button
    setIsSubmitting(true);


    try {
        // 5. Send data to server
        // Note: We don't send a refNum here because the Backend will create the YYYYMMDD-0001 format
        const response = await fetch('http://localhost:3001/api/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });


        const data = await response.json();


        if (response.ok) {
            // 6. SUCCESS: Get the ID and QR generated by the server
            setReferenceNumber(data.referenceNumber); // This will be the YYYYMMDD-XXXX format
            setQrImage(data.qrCode);
            setSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // 7. ERROR: Show duplicate or validation errors from server
            alert(data.error || "Failed to submit request.");
        }
    } catch (error) {
        console.error("Connection error:", error);
        alert("Could not connect to server. Ensure your backend (server.js) is running.");
    } finally {
        // Unlock button
        setIsSubmitting(false);
    }
  };


  const resetForm = () => {
    setFormData({
      fullName: '', studentNumber: '', email: '', college: '', program: '', phone: '',
      serviceCategory: '', specificService: '', purpose: '', isUrgent: '', urgencyDeadline: ''
    });
    setPrivacyAccepted(false);
    setSubmitted(false);
    setReferenceNumber('');
    setActiveTab('request');
  };


  // --- SMART CHATBOT HANDLER ---
  const handleSendMessage = (text) => {
    setChatMessages(prev => [...prev, { sender: 'user', text }]);
   
    setTimeout(() => {
      let botResponse = "I'm not sure about that specific detail. You can ask me about TOR, Diplomas, or Certifications!";
      const lowerText = text.toLowerCase();


      if (lowerText.match(/hello|hi|good morning|hey/)) {
        botResponse = "Hello! Go ahead and ask me about fees or processing times for your documents.";
      }
      else if (lowerText.includes("thank")) {
        botResponse = "You're welcome! Mabuhay ang Iskolar ng Bayan! 🎓";
      }
      else {
        Object.values(infoDatabase).forEach(item => {
          if (item.keywords.some(keyword => lowerText.includes(keyword))) {
            botResponse = item.response;
          }
        });
      }


      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 600);
  };


  const handleSendInput = () => {
    if (!inputMessage.trim()) return;
    handleSendMessage(inputMessage);
    setInputMessage('');
  };


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);


  const NavButton = ({ icon: Icon, label, tab }) => (
    <button
      onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        activeTab === tab ? 'bg-red-700 text-white' : 'text-gray-300 hover:bg-red-800/50'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );


  return (
    <div className="min-h-screen bg-gray-100 font-sans relative">
      {/* Header */}
      <header className="bg-red-900/95 backdrop-blur-sm border-b border-red-700 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-md">
                <Building className="text-red-900" size={24} />
              </div>
              <div>
                <h1 className="text-white text-lg md:text-xl font-bold tracking-tight">PUP Registrar Portal</h1>
                <p className="text-red-200 text-xs md:text-sm font-medium">Online Service Request System</p>
              </div>
            </div>
           
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white p-2 hover:bg-red-800 rounded-lg transition-colors">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>


            <nav className="hidden md:flex gap-2">
              {!isAdminLoggedIn ? (
                <>
                  <NavButton icon={Home} label="Home" tab="home" />
                  <NavButton icon={FileText} label="New Request" tab="request" />
                  <NavButton icon={Bell} label="Track Request" tab="track" />
                  <button onClick={() => setActiveTab('admin')} className="text-gray-300 hover:text-white px-4 py-2 flex items-center gap-2 transition-colors">
                    <Lock size={16}/> Admin
                  </button>
                </>
              ) : (
                <button onClick={() => { setIsAdminLoggedIn(false); setActiveTab('home'); setAdminUser(''); setAdminPass(''); }} className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 shadow-md">
                  <LogOut size={16}/> Logout
                </button>
              )}
            </nav>
          </div>


          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 flex flex-col gap-2 pb-2 animate-fadeIn">
              <NavButton icon={Home} label="Home" tab="home" />
              <NavButton icon={FileText} label="New Request" tab="request" />
              <NavButton icon={Bell} label="Track Request" tab="track" />
            </nav>
          )}
        </div>
      </header>


      <main className="max-w-7xl mx-auto px-4 py-8">
       
        {/* --- ADMIN SECTION --- */}
        {activeTab === 'admin' && (
          <div className="animate-fadeIn">
            {!isAdminLoggedIn ? (
              // ADMIN LOGIN
              <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl p-8 border-t-8 border-red-800 mt-10">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="text-red-800" size={32}/>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
                  <p className="text-sm text-gray-500">Authorized personnel only</p>
                </div>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input type="text" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"/>
                  </div>
                  <button type="submit" className="w-full bg-red-800 text-white py-2.5 rounded-lg hover:bg-red-900 font-bold transition-all shadow-md">
                    Login
                  </button>
                </form>
              </div>
            ) : (
              // ADMIN DASHBOARD
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <LayoutDashboard className="text-red-800"/> Admin Dashboard
                  </h2>


                  {/* --- SEARCH, SCAN, AND FILTER BAR --- */}
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
 
                    {/* 1. Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-red-500 outline-none shadow-sm"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="For Pickup">For Pickup</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
                    </select>


                    {/* 2. Global Search */}
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        placeholder="Search name, ID, or Ref..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500 outline-none shadow-sm"
                      />
                    </div>


                    {/* 3. Scan Button */}
                    <button
                      onClick={() => setShowScanner(!showScanner)}
                      className="bg-red-800 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-red-900 transition-all shadow-md"
                    >
                      <Camera size={18}/> {showScanner ? 'Close' : 'Scan'}
                    </button>
                  </div>
                </div>


                {/* --- NEW: CAMERA WINDOW --- */}
                {showScanner && (
                  <div className="bg-black p-4 rounded-xl flex flex-col items-center justify-center mb-6 animate-slideUp shadow-2xl">
                    <p className="text-white mb-3 text-sm font-medium flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> Point camera at QR Code
                    </p>
                    <div className="border-4 border-red-500 rounded-lg overflow-hidden w-64 h-64 relative bg-gray-900 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                      <Scanner
                        onScan={handleScan}
                        onError={(error) => console.log(error?.message)}
                        components={{ audio: false, finder: false }}
                        styles={{ container: { width: '100%', height: '100%' } }}
                      />
                    </div>
                  </div>
                )}
               
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                  <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-600">
                    <p className="text-xs text-gray-500 uppercase font-bold">Total Requests</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-600">
                    <p className="text-xs text-gray-500 uppercase font-bold">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
                    <p className="text-xs text-gray-500 uppercase font-bold">Processing</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.processing}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-800">
                    <p className="text-xs text-gray-500 uppercase font-bold">Pickup</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.pickup}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-600">
                    <p className="text-xs text-gray-500 uppercase font-bold">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-600">
                    <p className="text-xs text-gray-500 uppercase font-bold">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                </div>


                {/* Data Table with Filter */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                          <th className="px-6 py-4">Ref No.</th>
                          <th className="px-6 py-4">Student</th>
                          <th className="px-6 py-4">Service</th>
                          <th className="px-6 py-4 text-center">Urgency</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminData
                          .filter(req => {
                           
                            const searchTerm = adminSearch.toLowerCase();
                            const matchesSearch =
                              (req.reference_number || "").toLowerCase().includes(searchTerm) ||
                              (req.full_name || "").toLowerCase().includes(searchTerm) ||
                              (req.student_number || "").toLowerCase().includes(searchTerm);
                            const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
                            return matchesSearch && matchesStatus;
                          })
                          // ADD THESE TWO LINES BELOW TO FIX PAGINATION:
                          .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
                          .map((req) => (
                            <tr key={req.id} className="bg-white border-b hover:bg-gray-50">
                              <td className="px-6 py-4 font-bold text-gray-900">{req.reference_number}</td>
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">{req.full_name}</div>
                                <div className="text-xs text-gray-500">{req.student_number}</div>
                              </td>
                              <td className="px-6 py-4">{req.specific_service}</td>
                              <td className="px-6 py-4 text-center">
                                {req.is_urgent === 'Yes' ? (
                                  <div className="flex flex-col items-center">
                                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                                      URGENT
                                    </span>
                                    <span className="text-[10px] text-gray-500 mt-1">
                                      {new Date(req.urgency_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs">Standard</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {/* Status Badge with updated Purple for Processing */}
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                  req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  req.status === 'Processing' ? 'bg-purple-100 text-purple-800' :
                                  req.status === 'For Pickup' ? 'bg-blue-100 text-blue-800' :
                                  req.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <select
                                  value={req.status}
                                  onChange={(e) => handleStatusUpdate(req.id, e.target.value)}
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-red-500 outline-none block w-full p-2"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Processing">Processing</option>
                                  <option value="For Pickup">For Pickup</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  {/* NEW PAGINATION FOOTER */}
                  <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing page <span className="font-bold text-red-800">{currentPage}</span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold disabled:opacity-30 hover:bg-white transition-all"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={adminData.length <= currentPage * recordsPerPage}
                        className="px-4 py-2 bg-red-800 text-white rounded-lg text-xs font-bold disabled:opacity-30 hover:bg-red-900 transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        {/* --- HOME TAB --- */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-8 border-red-800">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">PUP Registrar's Office Online Service Portal</h1>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                This online portal is designed to streamline and centralize student transactions with the PUP Registrar's Office.
                Through this form, students may submit requests for official documents, academic records, and special academic processes without the need to queue in person.
              </p>
             
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <h3 className="font-bold text-red-800 flex items-center gap-2">
                  <Bot size={18}/> Need Help?
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Have questions about fees or requirements? Click the chat button below to ask <strong>PUP-Assist</strong> instantly!
                </p>
              </div>


              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> No online payments are processed through this system. Payment instructions will be provided separately by the Registrar's Office.
                </p>
              </div>
              <button onClick={() => setActiveTab('request')} className="bg-red-800 text-white px-8 py-3 rounded-md hover:bg-red-900 shadow-md font-medium transition-all">
                Proceed to Request Form
              </button>
            </div>
          </div>
        )}


        {/* --- REQUEST TAB --- */}
        {activeTab === 'request' && !submitted && (
          <div className="space-y-6">
            {!privacyAccepted ? (
              <div className="bg-white rounded-xl shadow-lg p-8 border-t-8 border-blue-600 animate-fadeIn">
                <div className="flex items-start gap-3 mb-4">
                  <Shield className="text-blue-600 mt-1" size={24} />
                  <h2 className="text-xl font-bold text-gray-800">Data Privacy Acknowledgement <span className="text-red-500">*</span></h2>
                </div>
                <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                  In accordance with the <strong>Data Privacy Act of 2012</strong>, I hereby authorize the PUP Registrar’s Office to collect and process my personal data.
                </p>
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-all">
                  <div
                    onClick={() => setPrivacyAccepted(true)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${privacyAccepted ? 'border-red-600' : 'border-gray-400'}`}
                  >
                    {privacyAccepted && <div className="w-3 h-3 bg-red-600 rounded-full" />}
                  </div>
                  <span className="text-gray-700 font-medium">I agree</span>
                </label>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setShowReview(true); }} className="space-y-6 animate-slideUp">
               
                {/* Student Info */}
                <div className="bg-white rounded-xl shadow-lg p-8 border-t-8 border-blue-400">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Student Information</h3>
                 
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name (LN, FN, MI) <span className="text-red-500">*</span></label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Dela Cruz, Juan A." required className="w-full px-0 py-2 border-b-2 border-gray-200 focus:border-red-700 outline-none transition-colors bg-transparent" />
                    </div>


                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Student Number <span className="text-red-500">*</span></label>
                      <input type="text" name="studentNumber" value={formData.studentNumber} onChange={handleInputChange} placeholder="20XX-XXXXX-MN-X" required className="w-full px-0 py-2 border-b-2 border-gray-200 focus:border-red-700 outline-none transition-colors bg-transparent" />
                    </div>


                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-0 py-2 border-b-2 border-gray-200 focus:border-red-700 outline-none transition-colors bg-transparent" />
                    </div>


                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">College <span className="text-red-500">*</span></label>
                      <select name="college" value={formData.college} onChange={handleCollegeChange} required className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none bg-white">
                        <option value="">Select College</option>
                        {Object.keys(collegeData).map((col) => <option key={col} value={col}>{col}</option>)}
                      </select>
                    </div>


                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Program <span className="text-red-500">*</span></label>
                      <select
                        name="program"
                        value={formData.program}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.college}
                        className={`w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none bg-white ${!formData.college ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      >
                        <option value="">{formData.college ? "Select Program" : "Please select a College first"}</option>
                        {formData.college && collegeData[formData.college] ? collegeData[formData.college].map((prog) => (
                          <option key={prog} value={prog}>{prog}</option>
                        )) : null}
                      </select>
                    </div>
                  </div>
                </div>


                {/* Service Selection */}
                <div className="bg-white rounded-xl shadow-lg p-8 border-t-8 border-blue-400">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Service Selection</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Service Category <span className="text-red-500">*</span></label>
                      <select name="serviceCategory" value={formData.serviceCategory} onChange={handleServiceChange} required className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none bg-white">
                        <option value="">Choose</option>
                        {Object.keys(serviceMapping).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>


                    <div className="animate-fadeIn">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Specific Service / Document <span className="text-red-500">*</span></label>
                      {!formData.serviceCategory ? (
                        <div className="p-3 bg-gray-100 text-gray-500 rounded-md text-sm italic">Please select a Service Category above.</div>
                      ) : (
                        <div className="space-y-2">
                          {serviceMapping[formData.serviceCategory].map((service) => (
                            <label key={service} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                              <input
                                type="radio"
                                name="specificService"
                                value={service}
                                checked={formData.specificService === service}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                              />
                              <span className="text-gray-700 text-sm">{service}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>


                {/* Urgency Handling */}
                <div className="bg-white rounded-xl shadow-lg p-8 border-t-8 border-blue-400">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Urgency Handling</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Is this request time-sensitive? <span className="text-red-500">*</span></label>
                      <div className="space-y-2">
                        {['Yes', 'No'].map((option) => (
                          <label key={option} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="isUrgent"
                              value={option}
                              checked={formData.isUrgent === option}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {formData.isUrgent === 'Yes' && (
                      <div className="animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 mb-2">If yes, when is it needed?</label>
                        <input type="date" name="urgencyDeadline" value={formData.urgencyDeadline} onChange={handleInputChange} min={today} className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none" />
                      </div>
                    )}
                  </div>
                </div>


                <div className="flex justify-between items-center pt-4">
                  <button type="button" onClick={() => setPrivacyAccepted(false)} className="text-gray-500 hover:text-red-700 font-medium">Back</button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-3 rounded-md shadow-md font-medium transition-all text-white ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-800 hover:bg-red-900'}`}
                  >
                    {isSubmitting ? 'Sending...' : 'Submit Request'}
                </button>
                </div>
              </form>
            )}
          </div>
        )}


        {/* Success Page */}
        {activeTab === 'request' && submitted && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center animate-slideUp border-t-8 border-green-600">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
            <p className="text-gray-600 mb-8">Your request has been recorded.</p>
            <img src={qrImage} alt="Your QR Code" className="w-48 h-48 mx-auto border-4 border-red-800 rounded-lg"/>
           
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8 inline-block min-w-[300px]">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Reference Number</p>
              <p className="text-3xl font-mono font-bold text-red-800">{referenceNumber}</p>
            </div>


            <div className="flex justify-center gap-4">
               <button onClick={resetForm} className="text-blue-600 hover:underline font-medium">Submit another response</button>
            </div>
          </div>
        )}


        {/* Tracking Tab */}
        {activeTab === 'track' && (
           <div className="bg-white rounded-xl shadow-lg p-8 border-t-8 border-red-800 animate-slideUp">
             <h2 className="text-2xl font-bold text-gray-900 mb-6">Track Your Request</h2>
             
             {!trackResult && (
               <div className="max-w-xl">
                 <label className="block text-sm font-medium text-gray-700 mb-2">Enter Reference Number</label>
                 <div className="flex gap-2">
                   <input
                     type="text"
                     value={searchRef}
                     onChange={(e) => setSearchRef(e.target.value)}
                     placeholder="Try: PUP-REG-2023-000123"
                     className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none"
                   />
                   <button onClick={handleTrack} className="bg-red-800 text-white px-6 py-3 rounded-md hover:bg-red-900 font-medium">Check Status</button>
                 </div>
               </div>
             )}


             {trackResult && (
               <div className="animate-fadeIn">
                 {trackResult.status === 'Rejected' ? (
                   <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center animate-bounceIn">
                     <XCircle className="mx-auto text-red-600 mb-3" size={56} />
                     <h3 className="text-2xl font-bold text-red-800 mb-2">Request Rejected</h3>
                     <p className="text-gray-600">We regret to inform you that your request has been declined. Please contact the Registrar's Office for more details.</p>
                   </div>
                 ) : trackResult.status === 'Not Found' ? (
                   <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-500">
                     Reference Number not found. Please check and try again.
                   </div>
                 ) : (
                   <div>
                     <div className="flex items-center justify-between mb-6 pb-6 border-b">
                       <div>
                         <p className="text-sm text-gray-500">Reference Number</p>
                         <p className="text-xl font-bold text-gray-800">{searchRef}</p>
                       </div>
                       <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                         trackResult.status === 'For Pickup' ? 'bg-indigo-100 text-indigo-800' :
                         trackResult.status === 'Completed' ? 'bg-green-100 text-green-800' :
                         'bg-yellow-100 text-yellow-800'
                       }`}>
                         {trackResult.status}
                       </div>
                     </div>


                     <div className="space-y-4 mb-8">
                       {['Pending', 'Processing', 'For Pickup', 'Completed'].map((step, idx) => (
                         <div key={step} className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                             trackResult.step > idx ? 'bg-green-600 text-white' :
                             trackResult.step === idx + 1 ? 'bg-blue-600 text-white' :
                             'bg-gray-200 text-gray-500'
                           }`}>
                             {trackResult.step > idx ? <CheckCircle size={16}/> : idx + 1}
                           </div>
                           <span className={`${trackResult.step === idx + 1 ? 'font-bold text-blue-900' : 'text-gray-600'}`}>{step}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}


                 <button onClick={() => { setTrackResult(null); setSearchRef(''); }} className="mt-8 text-gray-500 hover:text-gray-800 text-sm flex items-center gap-2">
                   <ArrowRight size={16}/> Check another reference
                 </button>
               </div>
             )}
           </div>
        )}
      </main>


      {/* --- PUP-ASSIST CHATBOT --- */}
      <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 transition-all duration-300 ${isChatOpen ? 'translate-y-0' : 'translate-y-2'}`}>
       
        {isChatOpen && (
          <div className="bg-white w-80 md:w-96 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slideUp">
            <div className="bg-red-900 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><Bot className="text-white" size={20} /></div>
                <div><h3 className="text-white font-bold text-sm">PUP-Assist</h3><p className="text-red-200 text-xs flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full"></span> Online</p></div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white"><XCircle size={20} /></button>
            </div>


            <div className="h-80 overflow-y-auto p-4 bg-gray-50 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-red-800 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                    <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }} />
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>


            <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500/50"
                onKeyPress={(e) => e.key === 'Enter' && handleSendInput()}
              />
              <button onClick={handleSendInput} className="p-2 bg-red-800 text-white rounded-full hover:bg-red-900 transition-colors">
                <Send size={16} />
              </button>
            </div>
          </div>
        )}


        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95 ${isChatOpen ? 'bg-gray-800 rotate-90' : 'bg-red-700 hover:bg-red-800'}`}
        >
          {isChatOpen ? <X className="text-white" size={28} /> : <MessageSquare className="text-white" size={28} />}
        </button>
      </div>


      {/* REVIEW MODAL */}
      {showReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scaleUp">
            <div className="bg-red-800 p-4 text-white text-center">
              <Shield className="mx-auto mb-2" size={32} />
              <h3 className="text-xl font-bold">Review Your Request</h3>
              <p className="text-red-100 text-xs">Please double-check for any typos</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm border-b pb-4">
                <span className="text-gray-500 font-medium">Name:</span>
                <span className="col-span-2 text-gray-900 font-bold uppercase">{formData.fullName}</span>
               
                <span className="text-gray-500 font-medium">Student No:</span>
                <span className="col-span-2 text-gray-900">{formData.studentNumber}</span>
               
                <span className="text-gray-500 font-medium">Email:</span>
                <span className="col-span-2 text-red-700 font-bold italic">{formData.email}</span>
               
                <span className="text-gray-500 font-medium">Service:</span>
                <span className="col-span-2 text-gray-900">{formData.specificService}</span>
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">
                By clicking confirm, you agree that the information above is accurate.
                Incorrect email addresses will result in not receiving your digital QR code.
              </p>
            </div>
            <div className="p-4 bg-gray-50 flex gap-3">
              <button onClick={() => setShowReview(false)} className="flex-1 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-white transition-all">
                Edit Info
              </button>
              <button
                onClick={(e) => { setShowReview(false); handleSubmit(e); }}
                className="flex-1 py-3 bg-red-800 text-white rounded-xl font-bold hover:bg-red-900 shadow-lg shadow-red-900/20 transition-all"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default PUPRegistrarPortal;

