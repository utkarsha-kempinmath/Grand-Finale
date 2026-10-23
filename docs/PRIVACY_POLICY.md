# PRIVACY POLICY FOR AAROGYA SEVA

**Effective Date:** October 24, 2026  
**Last Updated:** October 24, 2026  
**Application Name:** Aarogya Seva  
**Package Name:** com.ruralhealthcare.aarogyaseva  
**Contact Email:** privacy.aarogyaseva@gmail.com / support@aarogyaseva.org  

---

## 1. Introduction & Overview

Welcome to **Aarogya Seva** ("we", "our", or "us"). Aarogya Seva is a rural telemedicine and care-navigation platform designed to bridge the healthcare gap between rural communities, Accredited Social Health Activist (ASHA) workers, certified medical practitioners, and primary healthcare facilities.

This Privacy Policy explains how we collect, use, disclose, protect, and handle your information when you use our mobile application ("App") and associated healthcare services ("Services"). 

We are committed to maintaining the confidentiality, integrity, and security of our users' personal, medical, and location data in compliance with applicable digital healthcare and personal data protection regulations, including the Digital Personal Data Protection Act (DPDPA), the Ayushman Bharat Digital Mission (ABDM) guidelines, and Google Play Developer Program Policies.

By downloading, accessing, or using Aarogya Seva, you agree to the collection and use of information in accordance with this policy. If you do not agree with this policy, please do not use our App.

---

## 2. Information We Collect

We collect only information necessary to deliver safe, effective, and timely healthcare and emergency services.

### A. Personal Identification & Account Information
* **Basic Profile Data:** Full name, phone number, email address, age/date of birth, gender, preferred language (e.g., English, Hindi, Marathi), and residential village/district.
* **Role Credentials:** User role designation (Patient, ASHA Field Worker, Doctor, Facility Administrator, or Caregiver).
* **Google Sign-In Profile:** If you sign in using Google, we collect your name, email address, and avatar URL provided by Google’s OAuth service.

### B. Health, Medical & Consultation Data
* **Clinical Records:** Symptoms, vital signs, medical history, past diagnoses, prescription records, medication dosage schedules, and treatment progress notes.
* **Telemedicine & Consultations:** Appointment schedules, doctor clinical notes, follow-up recommendations, and digital prescriptions.
* **AI Triage & Chatbot Records:** Symptom descriptions and health queries submitted to our automated health assistant and AI voice triage system.

### C. Precise & Approximate Location Data
* **Permissions Requested:** `ACCESS_FINE_LOCATION` and `ACCESS_COARSE_LOCATION`.
* **Purpose of Location Processing:**
  1. **Nearby Healthcare Discovery:** To calculate distance and route navigation to the nearest Primary Health Centers (PHCs), sub-centers, hospitals, and pharmacies.
  2. **Emergency SOS Response:** When you press the Emergency SOS button, your current GPS coordinates are transmitted in real time to alert registered local ASHA workers, healthcare responders, and emergency transport services.
* **Background Location:** Aarogya Seva only captures your location when actively using the app or upon initiating an explicit Emergency SOS broadcast. We do not track your location in the background for advertising or analytics.

### D. Audio, Video & Device Permissions
* **Camera & Microphone:** Accessed strictly during active telemedicine video/audio calls with certified doctors, or when using voice navigation. We do not record or store raw consultation video feeds without explicit prior consent.
* **Storage & Secure Storage:** We use encrypted local storage (`expo-secure-store`) solely to persist authentication tokens and local user preferences securely on your device.

---

## 3. How We Use Your Information

We process personal and health information for the following legitimate purposes:
1. **Medical Care Delivery:** Facilitating doctor-patient remote teleconsultations, clinical diagnostics, digital prescriptions, and medication adherence reminders.
2. **ASHA Field Coordination:** Enabling community health workers to monitor rural patient cases and assist non-digital-native patients.
3. **Emergency Care Routing:** Providing immediate location-based alerts to local health resources during an SOS medical emergency.
4. **Platform Security & Authentication:** Verifying identity, preventing unauthorized access, and securing role-based medical records.
5. **Quality of Service:** Enhancing multilingual accessibility, user interface performance, and connectivity over low-bandwidth rural networks.

We do **NOT** sell, rent, monetize, or broker your personal or health data to advertisers, data brokers, or third-party marketing entities.

---

## 4. How We Share & Disclose Information

Your medical and personal data is strictly confidential. Information is disclosed only under these specific conditions:

* **With Your Treating Clinicians:** Qualified doctors and assigned ASHA workers treating your case have role-restricted access to your relevant medical history and case notes.
* **Emergency Medical Responders:** During an active SOS distress signal, your location and basic identification are shared with designated local emergency responders.
* **Third-Party Infrastructure & Service Providers:** We employ reputable third-party cloud infrastructure to operate the service:
  * **Google Play Services & Google Identity:** For user authentication.
  * **Render / Cloud Hosting:** For encrypted backend APIs, database hosting, and microservices orchestration.
  * **Calling / WebRTC Services:** For encrypted real-time audio and video teleconsultation pipelines.
  * These providers are bound by strict confidentiality and data-processing obligations and are prohibited from using your data for independent purposes.
* **Legal & Regulatory Obligations:** If required by applicable law, court order, or governmental healthcare authority under statutory health reporting requirements.

---

## 5. Data Security & Storage

We implement rigorous technical and organizational security standards:
* **Encryption in Transit:** All communications between the mobile application and our backend microservices are encrypted using Transport Layer Security (TLS 1.2 / 1.3 / HTTPS).
* **Authentication Security:** Secure JSON Web Tokens (JWT) and OAuth 2.0 protocols with industry-standard cryptographic signing.
* **Role-Based Access Control (RBAC):** Strict database authorization policies ensure that clinicians, ASHA workers, and patients can only access records they are explicitly authorized to view.
* **On-Device Storage:** Sensitive session tokens and security credentials on your phone are stored using hardware-backed cryptographic keychains via `expo-secure-store`.

---

## 6. Data Retention & Account Deletion Policy

In compliance with Google Play Developer Policies and global privacy standards:

* **Retention Period:** We retain personal and clinical data only as long as your account remains active or as required by applicable national medical record-keeping regulations.
* **Right to Delete:** You have the unconditional right to request the deletion of your account and associated personal data at any time.
* **How to Request Deletion:**
  * Within the App: Navigate to **Settings / Profile ➔ Request Account Deletion**.
  * By Email: Send a formal deletion request with your registered email or phone number to **privacy.aarogyaseva@gmail.com**.
  * Upon receiving your verified request, personal identifiers will be permanently deleted or anonymized within 30 days, subject to mandatory statutory medical record retention obligations.

---

## 7. Children's Privacy

Aarogya Seva does not knowingly collect personal information directly from children under 13 (or under 18 without parental/guardian supervision). Where pediatric care is administered in rural communities, records must be registered and managed under the supervision of a parent, legal guardian, or an accredited ASHA worker acting with parental consent.

---

## 8. User Rights

You possess the following rights regarding your personal information:
* **Access & Portability:** Request a copy of your stored health records and digital prescriptions.
* **Correction:** Request rectification of inaccurate or outdated demographic or contact information.
* **Withdrawal of Consent:** Revoke location, microphone, or camera permissions at any time through your Android operating system settings (`Settings ➔ Apps ➔ Aarogya Seva ➔ Permissions`).

---

## 9. Changes to this Privacy Policy

We may update this Privacy Policy from time to time to reflect evolving technical, operational, or regulatory practices. Any modifications will be posted within the App and updated at the top of this document ("Last Updated"). Your continued use of the App following any update constitutes acceptance of the revised terms.

---

## 10. Contact Us & Grievance Redressal

If you have questions, feedback, or concerns regarding this Privacy Policy or our data handling practices, please contact our Data Protection and Grievance Officer:

* **App / Project Name:** Aarogya Seva
* **Grievance Officer:** Privacy & Compliance Team
* **Email:** privacy.aarogyaseva@gmail.com
* **Official Website:** https://aarogyaseva.org
* **Address:** Aarogya Seva Project Office, Pune / Bangalore, India
