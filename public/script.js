const dialog = document.getElementById('loginDialog');
const loginLink = document.getElementById('loginLink');
const closeButton = document.getElementById('closeLogin');
const loginForm = document.getElementById('loginForm');
const signUpLink = document.getElementById('signUpLink');
const projectDiv = document.querySelector(".project-list");
const teamInfo = document.getElementById("teamInfo");
const bioDialog = document.getElementById("bioDialog");
const loginError = document.getElementById("error-message");
const partners = document.getElementById("partners");
const signUpForm = document.getElementById("signUpForm");
const loginButton = document.getElementById("submitLogin");
const eyeIcon = document.getElementById("eyeIcon");
const toast = document.getElementById("toast");
const resendEm = document.getElementById("resendVerEm");
const regDialog = document.getElementById("regDialog");
const otpDialog = document.getElementById("otpDialog");
const contactUsDialog = document.getElementById("contactUsDialog");

const openDialog = () => {
    dialog.showModal();
}
const closeDialog = () => {
    dialog.close();
}

const openReg = () => {
  closeDialog();
  regDialog.showModal();
  signUp();
}

const closeReg = () => {
  regDialog.close();
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  loginButton.textContent = "Logining in..."
  
  const username = document.getElementById('username').value.toLowerCase();
  const password = document.getElementById('password').value;

  const data = new URLSearchParams();
  data.append('username', username);
  data.append('password', password);

  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: data.toString(),
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        loginError.textContent = "Username Or Password Incorrect";
        setTimeout(() => {
          loginError.textContent = "";
        }, 2000);
        loginButton.textContent = "Login";
      } else if(data.message){
        toast.innerHTML = `
        <h3>Email verification required</h3>
        <p>Please verify your email to login.</p>       
    `;
            registerUser()
          loginButton.textContent = "Login";
          resendVerification();           ;
      } else if (data.redirectTo) {
        console.log(data.redirectTo);
        loginForm.reset();
        loginButton.textContent = "Login";
        window.location.href = data.redirectTo;
      }       
    })
    .catch(error => {
      console.error('Error during login:', error);
    });
  });

  closeButton.addEventListener("click",() => {
    closeDialog();
    loginForm.reset();
  });

  function handleKeyPress(event) {
    if (event.key === "Enter") {
      event.preventDefault(); 
      loginButton.click();
    }
  }

  eyeIcon.addEventListener("click", function() {
    const isPasswordVisible = document.getElementById("password").type === "text";
    document.getElementById("password").type = isPasswordVisible ? "password" : "text";

    eyeIcon.innerHTML = isPasswordVisible ? "show" : "hide"; 
  });

const signUp = () => {
    let usernameValid = false;
    let emailValid = false;
    let phoneValid = false;
    let passwordValid = false;



    const submitButton = document.getElementById("submitSignUp");

    function checkFormValidity() {
      if (usernameValid && emailValid && phoneValid && passwordValid) {
          submitButton.disabled = false;
          document.getElementById("regInfo").textContent = ""
      } else {
          submitButton.disabled = true;
          document.getElementById("regInfo").textContent = "The registration form will not submit untill all fields are filled correctly"
      }
  }
    document.getElementById("signUpForm").addEventListener("submit", (e) => {
        e.preventDefault();
        submitButton.textContent = "Signing up..."

        const username = document.getElementById('signUpUsername').value.toLowerCase();
        const password = document.getElementById('signUpPassword').value;
        const position = document.getElementById('signUpPosition').value;
        const email = document.getElementById('signUpEmail').value;
        const phone = document.getElementById('signUpPhone').value;
        const address = document.getElementById('signUpAddress').value;
        const nature = document.getElementById('signUpNature').value;
      
        const data = new URLSearchParams();
        data.append('username', username);
        data.append('password', password);
        data.append('position', position);
        data.append('email', email);
        data.append('phone', phone);
        data.append('address', address);
        data.append('nature', nature);
      
        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: data.toString(),
        })
        .then(response => {
          if (response.ok && response.redirected) {
            const form = document.getElementById("signUpForm");
            if (form) form.reset(); 
            submitButton.textContent = "Sign up";
            document.getElementById("usernameError").textContent = "";
            toast.innerHTML = `
        <h3>Registration Successful</h3>
        <p>You have been sent a verification email.</p>   
        <p>Please verify to login.</p>
    `;
            registerUser()
            setTimeout(() => {
              window.location.href = response.url;
          }, 4000);
        } else {
          toast.innerHTML = `
          <h3>Registration Failed</h3>
          <p>Please try gain later</p>   
          <p>If problem persists, contact customer support</p>
      `;        
        registerUser();
        submitButton.textContent = "Sign up";
            }
        })
        .catch(error => {
            console.error('Error during registration:', error);
            toast.innerHTML = `
            <h3>Registration Failed</h3>
            <p>Error connecting with server</p>   
            <p>Please check your internet connection</p>
      `;
            registerUser()
            submitButton.textContent = "Sign up";
        });
      });

      let nameTimer;
      document.getElementById("signUpUsername").addEventListener("input", () => {
        const value = document.getElementById("signUpUsername").value.toLowerCase();        
        const messageEl = document.getElementById("usernameError");

        clearTimeout(nameTimer);

        nameTimer = setTimeout(() => {
          if (value.length >= 3) { 
            fetch(`/username?username=${value}`)
              .then(response => response.json()) 
              .then(data => {
                console.log(data);
                if (data.exists) {
                  messageEl.textContent = `${value} has already been used`;
                  messageEl.style.color = "red";
                  usernameValid = false;
                } else {
                  messageEl.textContent = `${value} is available`;
                  messageEl.style.color = "green";
                  usernameValid = true;
                }
                checkFormValidity();
              })
              .catch(error => {
                console.error('Error checking username:', error);
              });
          }
          }, 2000);
      });

      let debounceTimer;
      document.getElementById("signUpEmail").addEventListener("input", () => {
        const value = document.getElementById("signUpEmail").value;
        const messageEl = document.getElementById("emailError"); 
        clearTimeout(debounceTimer);
        
        debounceTimer = setTimeout(() => {
          if (value.length >= 5 && value.includes("@")) {  
              fetch(`/email?email=${encodeURIComponent(value)}`)
                  .then(response => response.json())
                  .then(data => {
                      console.log(data);
                      if (data.exists) {
                          messageEl.textContent = `${value} has already been used`;
                          messageEl.style.color = "red";
                      } else {
                          messageEl.textContent = data.message;  // Show DNS validation message
                          messageEl.style.color = data.message.includes("valid") ? "green" : "red";
                          if(data.message === "") {
                            emailValid = true;
                          } else {
                            emailValid = false;
                          }
                          checkFormValidity();
                      }
                  })
                  .catch(error => {
                      console.error("Error checking email:", error);
                      messageEl.textContent = "Error checking email";
                      messageEl.style.color = "red";
                      emailValid = false;
                  });
          } else {
              messageEl.textContent = "Enter a valid email";
              messageEl.style.color = "red";
              emailValid = false;
          } 
        }, 2000);
    });
    
    let numberTimer;
      document.getElementById("signUpPhone").addEventListener("input", () => {
        const value = document.getElementById("signUpPhone").value;
        const messageEl = document.getElementById("phoneError");

        clearTimeout(numberTimer);
        
        numberTimer = setTimeout(() => {
          if (value.length >= 10) { 
            fetch(`/phone?phone=${value}`)
              .then(response => response.json())
              .then(data => {
                console.log(data); 
                if (data.exists) {
                  messageEl.textContent = `${value} has already been used`;
                  messageEl.style.color = "red"; 
                } else {
                  messageEl.textContent = data.message;
                  messageEl.style.color = "red";
                  if(data.message === "") {
                    phoneValid = true;
                  } else {
                    phoneValid = false;
                  }
                  checkFormValidity();
                }
              })
              .catch(error => {
                console.error('Error checking phone number:', error);
                messageEl.textContent = "An error occurred. Please try again.";
                messageEl.style.color = "red";
                phoneValid = false;
              }); 
          } else {
            // Show an error message if phone number is too short
            messageEl.textContent = "Please enter a valid phone number.";
            messageEl.style.color = "red";
            phoneValid = false;
          }
        }, 2000);
      });

      document.addEventListener("input", (event) => {
        if (event.target.matches("input[name='username']")) {
          const input = event.target;
          const value = input.value.trim();
          const messageEl = document.getElementById("usernameError");
      
          if (value.length < 3) {
            input.setCustomValidity("Username must be at least 3 characters long.");
            messageEl.textContent = "Username must be at least 3 characters long.";
            usernameValid = false;
          } else {
            input.setCustomValidity(""); 
            messageEl.textContent = "";
          }
        }
      });
      
      document.addEventListener("input", (event) => {
        if (event.target.matches("input[name='password']")) {
          const input = event.target;
          const value = input.value;
          const messageEl = document.getElementById("passwordError");
      
          if (value.length < 8) {
            input.setCustomValidity("Password must be at least 8 characters long.");
            messageEl.textContent = "Password must be at least 8 characters long.";
            passwordValid = false;
          } else if (value.includes(" ")){
            input.setCustomValidity("Password must be not contain space.");
            messageEl.textContent = "Password must be not contain space.";
            passwordValid = false;
          }else {
            input.setCustomValidity(""); 
            messageEl.textContent = "";
            passwordValid = true
          }
        }
      });
    
    const passwordInput = document.getElementById("signUpPassword");
    const eyeIcon = document.getElementById("signUpShow");

    eyeIcon.addEventListener("click", function() {
      const isPasswordVisible = passwordInput.type === "text";
      passwordInput.type = isPasswordVisible ? "password" : "text";

      eyeIcon.innerHTML = isPasswordVisible ? "show" : "hide";
    });

  };

  const originalContent = `
      <div class="projectUl">                           
        <ul style="list-style-position: inside;">
          <h5 class="fw-bold mb-3" id="project-head">OIL AND GAS PROJECTS</h5>
          <li class="fw-bold m-3 sideBarli">NLNG Train 7 Project</li>
          <li class="fw-bold m-3 sideBarli">AKK Gas Pipeline Project</li>
          <li class="fw-bold m-3 sideBarli">Shell Southern Swamp AGS 3B Project</li>
          <li class="fw-bold m-3 sideBarli">Preowei Deepwater Dev. Project</li>
        </ul>
      </div>
    
      <div class="row mb-2 moreDiv">
        <div class="col-4"></div>
        <div class="col-4"></div>
        <div class="col-4">
          <p class="text-end fw-bold more d-flex">more <i class="bi bi-chevron-double-right"></i></p>
        </div>
      </div>
      
      <section id="toolsSection" class="py-2">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-lg-8">
              <h2 class="display-5 text-light fw-bold mb-2">TOOLS FOR SUCCESS</h2>
              <p class="lead text-light">
                EPDM tracks thousands of energy projects and provides real-time, accurate, and reliable resources for companies seeking new business opportunities and up-to-date industry insights. EPDM delivers the latest information on planned, ongoing, and future energy projects to empower your success.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <div class="input-group input-group-sm mt-2 mb-1 d-flex justify-content-end">
        <span class="input-group-text" id="searchSpan">Search</span>
        <input type="text" class="form-control" id="searchInput">
      </div>

      <div class="input-group input-group-sm mt-2 mb-1 d-flex justify-content-end">
        <button class="btn" style="background-color: #44537c; color: white;">Request a Demo</button>
      </div>

    </div>  
      `;

const aboutUs = () => {
    projectDiv.innerHTML = `<!-- Element where the document will be displayed -->
    <div class="container mt-0">
      <div id="documentContainer" class="document-display">
        <button id="closeAboutUs" class="close-btn">
          <i class="bi bi-chevron-double-left"></i> Back
        </button>
        <div class="card">
          <div class="card-header">
            <h5>About EPDM Energy</h5>
          </div>
          <div class="card-body">
            <h6>History</h6>
            <p>
            Energy Projects Data Media Limited (EPDM), a Lagos-based digital energy projects data company
            and energy consulting firm. It has a broad base of experienced professionals in various sectors
            especially in the energy industry.
            The company is a dynamic enterprise with special interests in oil, gas and power projects tracking,
            online project data marketing and energy consultancy services. It has an image as a quality
            company providing quality services consistently.
            EPDM is highly committed to providing concise in-depth information for companies looking for
            project related business opportunities within the Nigeria oil, gas and power industries.
            We are young and dynamic energy consulting firm, highly committed to serving the global energy
            community through information dissemination on energy projects/project related business
            opportunities.            
            </p>
            <h6>Our Mission</h6>
            <p>
            To provide real-time, reliable/valuable energy projects data and business information to the global
            energy community.
            </p>  
            <h6>Our Vision</h6>
            <p>To be a global energy projects data marketplace for the global energy community.</p>
            <h6>Our Values</h6>
            <p>We values integrity, hard work, quality of service delivery and the capability of our team.
            </p>
          </div>
        </div>
      </div>
    </div>`;

    document.getElementById('closeAboutUs').addEventListener('click', () => {
        projectDiv.innerHTML = originalContent;
    });
};

const services = () => {
    projectDiv.innerHTML = `
    <div class="container mt-0">
      <div class="document-display" style = "min-width: 50%;">
        <button id="closeServices" class="close-btn">
          <i class="bi bi-chevron-double-left"></i> Back
        </button>
        <div class="card" style = "margin: 5px auto">
          <div class="card-header">
            <h5>Services</h5>
          </div>
          <div class="card-body">
            <h6>
            Energy Projects Data Media Limited with its experienced and sound professionals provides the 
            energy industry the following services:
            </h6>
            <ul>
                <li>Energy Projects Tracking</li>
                <li>Online Energy Projects Data Marketing</li>
                <li>Energy Consultancy Services </li>
                <li>Project Management Consulting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>`;

    document.getElementById('closeServices').addEventListener('click', () => {
        projectDiv.innerHTML = originalContent;
    });
};

const contactUs = () => {
  contactUsDialog.showModal();

    document.getElementById("contactUsCancel").addEventListener("click", () => {
      contactUsDialog.close();
    });

    document.getElementById("contactUsSubmit").addEventListener("submit", (e) => {
      contactUsDialog.close();
    });
};

let epdmData = [
    {
    "name": "Donald Ibegbu",
    "role": "Founder/CEO",
    "bio": "He holds a bachelor’s degree in Petroleum Engineering from Federal University of Technology Owerri (FUTO), Nigeria and has attended various technical, management, and local content courses and certifications both in Nigeria and overseas. Donald Ibegbu has twenty-one (21) years working experience with significant exposure and experience in the Nigerian oil and gas sector gained from various organizations including: Department of Petroleum Resources (now Nigerian Upstream Petroleum Regulatory Commission), Landmark Goldlinks Limited, Cameron Flow Control Technology Nigeria Limited, Cameron Valves and Measurement West Africa, Cameron Process Systems International, OneSubsea Offshore Systems Nigeria Limited, and Schlumberger Nigeria Limited where he worked as Nigerian Content Development Manager before joining EPDM as CEO. He also worked on major oil and gas projects including: over $800 million dollars Usan Deepwater Development Project (engineering, procurement, construction, testing and installation of subsea production systems) awarded to OneSubsea Offshore Systems Nigeria Limited, over $650 million dollars Erha North Phase 2 Deepwater Development Project (engineering, procurement, construction, testing and installation of subsea production systems) awarded to OneSubsea, and other projects. Donald Ibegbu is the Author and Publisher of Nigeria Energy Business Handbook. He is a member of the Society of Petroleum Engineers (SPE). Donald Ibegbu has won several awards and recognition including state award for his contributions in building education in Anambra State-Nigeria and others.",
    "imageUrl": "https://raw.githubusercontent.com/Dragsvillestar/new-git/refs/heads/master/5.jpg"
    },
    {
    "name": "Ikechukwu Chukwurah",
    "role": "Operations",
    "bio": "He holds a bachelor`s degree in Mechanical Engineering from Enugu State University of Science and Technology, Nigeria and Master of Science in Project Management from University of Roehampton, United Kingdom. He attended engineering and project management courses and certifications both in Nigeria and overseas. He worked in several capacities as a Field Engineer in WEAFRI Well Services Company Limited, gaining experience in well intervention: stimulation, nitrogen, coiled tubing, and other related pumping services. In Baker Hughes, he started as a Technical Support Engineer. He worked in various technical positions and also interfaced between customers and operations. He worked as a Project Coordinator on the subsea contract operations of Usan Deepwater Oilfield Project awarded to OneSubsea Offshore Systems Nigeria Limited to provide subsea systems for the initial phase of the 44-well Usan subsea development. He has thirteen (13) years working experience.",
    "imageUrl": "https://raw.githubusercontent.com/Dragsvillestar/new-git/refs/heads/master/6.jpg"
    },
    {
      "name": "Kelechi Nwagbara",
      "role": "Customer Relations",
      "bio": "Kelechi Nwagbara holds a Bachelor of Laws (L.L.B) Hons from Rivers State University of Science and Technology. She has thirteen (13) years working experience with DGB and Associates Nigeria Limited as an Immigration Attorney. She also worked as an In-house Immigration Consultant assigned to Schlumberger Nigeria by DGB. Kelechi Nwagbara has extensive knowledge of Nigerian Immigration Law and regulations, expatriate administration, analytical skills, and administrative skills. She is a member of the Nigerian Bar Association (NBA).",
      "imageUrl": "https://raw.githubusercontent.com/Dragsvillestar/new-git/refs/heads/master/7.jpg"
    },
    {
      "name": "Nwadibe Colman Chidozie",
      "role": "Finance",
      "bio": "He holds a bachelor’s degree in Accounting from Nnamdi Azikiwe University, Awka, Anambra State. Nwadibe Colman Chidozie worked with Brem Networks and Service Limited as a Project Coordinator and Frank Charles Industry and Company Limited as an Accountant. He has fifteen (15) years working experience.",
      "imageUrl": "https://raw.githubusercontent.com/Dragsvillestar/new-git/refs/heads/master/8.jpg"
    },
    {
      "name": "Dr. Charles Enweugwu",
      "role": "Adviser",
      "bio": "Dr. Charles Enweugwu holds a bachelor’s degree in Physics from the University of Lagos, a Post Graduate Diploma in Petroleum Engineering from the University of Ibadan, an MBA from Ladoke Akintola University of Technology, a Master’s degree in Applied Geophysics from the University of Lagos, and M.Sc and PhD in Petroleum Economics from the University of Port Harcourt. He has thirty-five (35) years of working experience with the Department of Petroleum Resources (now the Nigerian Upstream Petroleum Regulatory Commission), where he retired as a Manager. Dr. Enweugwu is a member of the Society of Petroleum Engineers (SPE) and the Nigerian Association of Petroleum Explorationists (NAPE).",
      "imageUrl": "https://raw.githubusercontent.com/Dragsvillestar/new-git/refs/heads/master/9.png"
    },
    {
    "name": "Dewuni Shittu Adebowale",
    "role": "Adviser",
    "bio": "Dewuni Shittu Adebowale holds a bachelor’s degree in Applied Geophysics from the University of Ife, Ile-Ife (now Obafemi Awolowo University, OAU), a Post Graduate Diploma in Computer Science from the University of Lagos, and an MBA from Edo State University, Ekpoma. He has thirty-five (35) years of working experience with organizations such as Schlumberger Nigeria Limited (WesternGeco & SIS), where he served as Sales Manager, Guarantee Petroleum Company Limited as Operations Manager, Subsurface Asset Management Ltd (Reservoir Management Company) as Business Development Manager, Lenoil Group (Westcoast Petroleum Ltd) as Project Manager (Upstream), Versa-Tech Nigeria Limited as Geophysical Operations Supervisor, and United Geophysical Nigeria Limited as Senior Seismologist. Dewuni is a member of the Nigerian Association of Petroleum Explorationists (NAPE).",
    "imageUrl": "https://raw.githubusercontent.com/Dragsvillestar/new-git/refs/heads/master/12.jpg"
    },
    {
      "name": "Chinedu Ikeagwuani",
      "role": "Adviser",
      "bio": "Chinedu Ikeagwuani holds a bachelor’s degree in Electrical Engineering from the University of Lagos and a Post Graduate Diploma in Petroleum Engineering from Heriot-Watt University, United Kingdom. He has twenty-six (26) years of working experience and began his career with Schlumberger as a General Field Engineer (North Sea, United Kingdom). Over the years, he has held various technical and managerial positions, including Specialist Field Engineer (Gulf Coast, USA), Service Delivery Manager/Technical Manager (Nigeria), Location Manager (Vietnam), Sales and Marketing Manager (East, Central, and South Africa - HQ in Angola), Quality Manager (South America Continent - HQ in Brazil), South America Asset and Planning Manager (HQ in Rio de Janeiro, Brazil), Operations Manager (Nigeria and West Africa), and Director of Group Intervention Projects/Accounts (Nigeria). He is a member of the Society of Petroleum Engineers (SPE).",
      "imageUrl": "https://raw.githubusercontent.com/Dragsvillestar/new-git/refs/heads/master/10.jpg"
    },
    {
      "name": "Samuel Joseph Okoye",
      "role": "Adviser",
      "bio": "Samuel Joseph Okoye, a chartered accountant and chartered tax practitioner by academic and professional training, has 20 years of postgraduate and professional work experience covering branch banking operations, credit, retail and commercial banking, marketing, asset remedial management, strategy, risk management, internal control, international banking, foreign exchange treasury management, operational information technology, financial control, tax, research and training, customer service, and relationship management. He has worked in banks such as United Bank for Africa Plc, the acquired Continental Trust Bank, Intercontinental Bank Plc, and Bank PHB Plc. Samuel won the Best Customer-Friendly Officer Award and Star Deposit Mobilizer Commendation at both United Bank for Africa Plc and Intercontinental Bank Plc. He was the pioneer Financial Controller of PHB BDC Ltd, managing financial assets worth over 3 billion naira at the age of 30 in 2010. He later joined Chams Consortium Ltd as the pioneer CFO for the National Identity Management Project. He resigned to focus on consulting and has authored ten pioneering books on Accounting and Taxation. He is an active member of the Chartered Institute of Taxation of Nigeria (CITN) and the Institute of Chartered Accountants of Nigeria (ICAN), serving on various committees since 2009.",
      "imageUrl": "https://raw.githubusercontent.com/Dragsvillestar/new-git/refs/heads/master/11.png"
    }
  ]
  ;

const ourTeam = () => {
    const teamers = epdmData.map(member => `
    <div class="col-md-6 col-lg-3 d-flex justify-content-center">
        <div class="memberCard bg-light rounded">
            <div class="card-body text-center mt-3">
                <img src="${member.imageUrl}" alt="" class="rounded-circle image-fluid mb-3">
                <div class="card-title mb-3"><strong>${member.name}</strong></div>
                <div class="card-text mb-3">${member.role}</div> 
                <a href = "#" onclick = "openBio('${member.name}')">Read Bio</a>
            </div>
        </div>
    </div>
    `).join("");

    const memberDisplay = `
    <div class = "row g-3">
        ${teamers}
    </div>
    `;
    projectDiv.innerHTML = `
    <div class="container mt-0">
      <div class="document-display">
        <button id="closeOurTeam" class="close-btn mb-2">
          <i class="bi bi-chevron-double-left"></i> Back
        </button>
        ${memberDisplay}
      </div>
    </div>
    `;

    document.getElementById('closeOurTeam').addEventListener('click', () => {
        projectDiv.innerHTML = originalContent;
    });
}

const openBio = (name) => {
    const member = epdmData.find(member => member.name === name);

    bioDialog.innerHTML = `
        <img src="${member.imageUrl}" alt="${member.name}" class="rounded-circle mb-3 memberImg">
        <h5>${member.name}</h5>
        <p>${member.bio}</p>
        <button type="button" id="closeBio">Close</button>
    `;

    bioDialog.showModal();
    bioDialog.scrollTo(0, 0);

    const closeBio = document.getElementById("closeBio");
    closeBio.addEventListener("click", () => {
        bioDialog.close();
        bioDialog.innerHTML = ""; 
    });
};

function registerUser() {
  toast.classList.add("show");

  setTimeout(function() {
    toast.classList.remove("show");
  }, 5000); 
}

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("verified")) {
      const verifiedStatus = urlParams.get("verified") === "true";
      const messageDiv = document.createElement("div");

      if (verifiedStatus) {
        toast.innerHTML = `
        <h3>Email Verification Successful</h3>
        <p>Your email has been verified</p>   
        <p>You can now login.</p>        
    `;
            registerUser()
      } else {
        toast.innerHTML = `
        <h3>Email Not Verified</h3>
        <p>You have been sent a verification email</p>   
        <p>Please verify to login.</p>        
    `;
            registerUser()
            resendVerification();
      }
      history.replaceState(null, "", window.location.pathname);
  }
});
 
let timerStartTime = null;
let countdownTimer = null;
let timeLeft;

const resendVerification = () => {
resendEm.style.display = "inline-block";
}

resendEm.addEventListener("click", () => {
  const user = document.getElementById("username").value.trim().toLowerCase();

  if (!user) {
    loginError.textContent = "Enter your username";
    setTimeout(() => {
      loginError.textContent = "";
    }, 3000);
    return; 
}

  fetch("/resend-email-verification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: user }),
  })
    .then(response => response.json())
    .then(data => {
      loginError.textContent = data.message;
      setTimeout(() => {
        loginError.textContent = "";
      }, 3000);

      if (data.timeLeft) {
        timeLeft = data.timeLeft; 
      } else {
        timeLeft = 30;
      }
      if (!countdownTimer){
        resendEm.disabled = true;
        resendEm.textContent = `Resend in ${timeLeft}s`;
  
        countdownTimer = setInterval(() => {
        timeLeft--;
        resendEm.textContent = `Resend in ${timeLeft}s`;
    
      if (timeLeft <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        resendEm.textContent = "Send verification email";
        resendEm.disabled = false; 
    }
      }, 1000)
      }
      })
      .catch(error => console.error("Error:", error));  
});

const openOtp = () => {
    otpDialog.showModal()
    initOtpInput();
};

const closeOtp = () => {
  otpDialog.close()
}

function initOtpInput() {
  const inputs = document.querySelectorAll('.otp-container input');
  const otpInput = document.getElementById('otpInput');
  const otpForm = document.getElementById('otpForm');

  inputs.forEach((input, index) => {
      input.value = ''; 
      input.addEventListener('input', (e) => {
          if (e.inputType === 'deleteContentBackward' && index > 0) {
              inputs[index - 1].focus();
          } else if (input.value.match(/[0-9]/)) {
              if (index < inputs.length - 1) {
                  inputs[index + 1].focus();
              }
          } else {
              input.value = ''; 
          }

          updateOtpHiddenField();
      });

      input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && index > 0 && !input.value) {
              inputs[index - 1].focus();
          }
      });
  });

  function updateOtpHiddenField() {
      otpInput.value = Array.from(inputs).map(input => input.value).join('');
      if (otpInput.value.length === 6) {
          otpForm.submit();
      }
  }

  inputs[0].focus(); 
}
