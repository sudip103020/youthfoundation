import { useEffect, useState } from "react";

import {
    EmailAuthProvider,
    onAuthStateChanged,
    reauthenticateWithCredential,
    updatePassword,
} from "firebase/auth";

import {
    collection,
    doc,
    getDocs,
    query,
    updateDoc,
    where,
} from "firebase/firestore";

import { db, auth } from "../firebase/firebase";

import AdminLayout from "./AdminLayout";

// =====================================================
// CLOUDINARY CONFIG
// =====================================================

// তোমার existing Cloudinary cloud name এখানে দাও
const CLOUDINARY_CLOUD_NAME = "dvpfixfd";

// তোমার existing unsigned upload preset এখানে দাও
const CLOUDINARY_UPLOAD_PRESET = "badokhali_youth_foundation";

// =====================================================
// PROFILE INTERFACE
// =====================================================

interface ProfileData {
    docId: string;

    uid: string;

    name: string;

    designation: string;

    phone: string;

    email: string;

    bloodGroup: string;

    dateOfBirth: string;

    photo: string;
}

// =====================================================
// SETTINGS
// =====================================================

const Settings = () => {
    // ===================================================
    // PROFILE STATES
    // ===================================================

    const [profile, setProfile] =
        useState<ProfileData | null>(null);

    const [loadingProfile, setLoadingProfile] =
        useState(true);

    const [savingProfile, setSavingProfile] =
        useState(false);

    // ===================================================
    // PROFILE FORM
    // ===================================================

    const [name, setName] =
        useState("");

    const [designation, setDesignation] =
        useState("");

    const [phone, setPhone] =
        useState("");

    const [bloodGroup, setBloodGroup] =
        useState("");

    const [dateOfBirth, setDateOfBirth] =
        useState("");

    // ===================================================
    // PHOTO STATES
    // ===================================================

    const [photo, setPhoto] =
        useState("");

    const [selectedPhoto, setSelectedPhoto] =
        useState<File | null>(null);

    const [photoPreview, setPhotoPreview] =
        useState("");

    const [uploadingPhoto, setUploadingPhoto] =
        useState(false);

    // ===================================================
    // PASSWORD STATES
    // ===================================================

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [changingPassword, setChangingPassword] =
        useState(false);

    // ===================================================
    // PASSWORD VISIBILITY
    // ===================================================

    const [showCurrentPassword, setShowCurrentPassword] =
        useState(false);

    const [showNewPassword, setShowNewPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    // ===================================================
    // MESSAGE
    // ===================================================

    const [successMessage, setSuccessMessage] =
        useState("");

    const [errorMessage, setErrorMessage] =
        useState("");

    // ===================================================
    // LOAD PROFILE
    // ===================================================

    const loadProfile = async (uid: string) => {
        try {
            setLoadingProfile(true);

            const q = query(
                collection(db, "members"),
                where("uid", "==", uid)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                setErrorMessage(
                    "Profile information was not found."
                );

                return;
            }

            const profileDoc = snapshot.docs[0];

            const data = profileDoc.data();

            const profileData: ProfileData = {
                docId: profileDoc.id,

                uid: data.uid || uid,

                name: data.name || "",

                designation:
                    data.designation || "",

                phone: data.phone || "",

                email:
                    data.email ||
                    auth.currentUser?.email ||
                    "",

                bloodGroup:
                    data.bloodGroup || "",

                dateOfBirth:
                    data.dateOfBirth || "",

                photo: data.photo || "",
            };

            setProfile(profileData);

            // -----------------------------------------------
            // SET FORM VALUES
            // -----------------------------------------------

            setName(profileData.name);

            setDesignation(
                profileData.designation
            );

            setPhone(profileData.phone);

            setBloodGroup(
                profileData.bloodGroup
            );

            setDateOfBirth(
                profileData.dateOfBirth
            );

            setPhoto(profileData.photo);

            setPhotoPreview(
                profileData.photo
            );
        } catch (error) {
            console.error(
                "Load settings profile error:",
                error
            );

            setErrorMessage(
                "Failed to load profile information."
            );
        } finally {
            setLoadingProfile(false);
        }
    };

    // ===================================================
    // AUTH
    // ===================================================

    useEffect(() => {
        const unsubscribe =
            onAuthStateChanged(
                auth,
                async (user) => {
                    if (!user) {
                        setLoadingProfile(false);

                        setErrorMessage(
                            "You are not logged in."
                        );

                        return;
                    }

                    await loadProfile(user.uid);
                }
            );

        return () => {
            unsubscribe();
        };
    }, []);

    // ===================================================
    // SELECT PHOTO
    // ===================================================

    const handlePhotoSelect = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        // -----------------------------------------------
        // FILE TYPE
        // -----------------------------------------------

        if (!file.type.startsWith("image/")) {
            setErrorMessage(
                "Please select a valid image file."
            );

            return;
        }

        // -----------------------------------------------
        // FILE SIZE
        // -----------------------------------------------

        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage(
                "Image size must be less than 5MB."
            );

            return;
        }

        setErrorMessage("");

        setSelectedPhoto(file);

        // -----------------------------------------------
        // PREVIEW
        // -----------------------------------------------

        const previewUrl =
            URL.createObjectURL(file);

        setPhotoPreview(previewUrl);
    };

    // ===================================================
    // UPLOAD PHOTO TO CLOUDINARY
    // ===================================================

    const uploadPhoto = async (
        file: File
    ): Promise<string | null> => {
        try {
            setUploadingPhoto(true);

            const formData =
                new FormData();

            formData.append(
                "file",
                file
            );

            formData.append(
                "upload_preset",
                CLOUDINARY_UPLOAD_PRESET
            );

            const response =
                await fetch(
                    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Cloudinary upload failed."
                );
            }

            const data =
                await response.json();

            return data.secure_url || null;
        } catch (error) {
            console.error(
                "Cloudinary upload error:",
                error
            );

            return null;
        } finally {
            setUploadingPhoto(false);
        }
    };

    // ===================================================
    // UPDATE PROFILE
    // ===================================================

    const handleUpdateProfile = async () => {
        const currentUser =
            auth.currentUser;

        if (!currentUser) {
            setErrorMessage(
                "You are not logged in."
            );

            return;
        }

        if (!profile) {
            setErrorMessage(
                "Profile information not found."
            );

            return;
        }

        if (!name.trim()) {
            setErrorMessage(
                "Name is required."
            );

            return;
        }

        try {
            setSavingProfile(true);

            setSuccessMessage("");

            setErrorMessage("");

            let updatedPhoto = photo;

            // -----------------------------------------------
            // UPLOAD NEW PHOTO
            // -----------------------------------------------

            if (selectedPhoto) {
                const uploadedPhoto =
                    await uploadPhoto(
                        selectedPhoto
                    );

                if (!uploadedPhoto) {
                    setErrorMessage(
                        "Failed to upload profile picture."
                    );

                    return;
                }

                updatedPhoto =
                    uploadedPhoto;
            }

            // -----------------------------------------------
            // UPDATE FIRESTORE
            // -----------------------------------------------

            await updateDoc(
                doc(
                    db,
                    "members",
                    profile.docId
                ),
                {
                    name: name.trim(),

                    
                    phone: phone.trim(),

                    bloodGroup:
                        bloodGroup.trim(),

                    dateOfBirth:
                        dateOfBirth,

                    photo:
                        updatedPhoto,
                }
            );

            // -----------------------------------------------
            // UPDATE LOCAL STATE
            // -----------------------------------------------

            setPhoto(updatedPhoto);

            setPhotoPreview(updatedPhoto);

            setSelectedPhoto(null);

            setProfile({
                ...profile,

                name: name.trim(),

              

                phone: phone.trim(),

                bloodGroup:
                    bloodGroup.trim(),

                dateOfBirth,

                photo: updatedPhoto,
            });

            setSuccessMessage(
                "Profile updated successfully."
            );
        } catch (error) {
            console.error(
                "Update profile error:",
                error
            );

            setErrorMessage(
                "Failed to update profile. Please try again."
            );
        } finally {
            setSavingProfile(false);
        }
    };

    // ===================================================
    // CHANGE PASSWORD
    // ===================================================

    const handleChangePassword =
        async () => {
            const currentUser =
                auth.currentUser;

            if (!currentUser) {
                setErrorMessage(
                    "You are not logged in."
                );

                return;
            }

            // -----------------------------------------------
            // VALIDATION
            // -----------------------------------------------

            if (!currentPassword) {
                setErrorMessage(
                    "Please enter your current password."
                );

                return;
            }

            if (!newPassword) {
                setErrorMessage(
                    "Please enter your new password."
                );

                return;
            }

            if (newPassword.length < 6) {
                setErrorMessage(
                    "New password must be at least 6 characters."
                );

                return;
            }

            if (
                newPassword !==
                confirmPassword
            ) {
                setErrorMessage(
                    "New password and confirm password do not match."
                );

                return;
            }

            if (
                currentPassword ===
                newPassword
            ) {
                setErrorMessage(
                    "New password must be different from your current password."
                );

                return;
            }

            if (!currentUser.email) {
                setErrorMessage(
                    "Your account does not have an email address."
                );

                return;
            }

            try {
                setChangingPassword(true);

                setSuccessMessage("");

                setErrorMessage("");

                // ---------------------------------------------
                // RE-AUTHENTICATE USER
                // ---------------------------------------------

                const credential =
                    EmailAuthProvider.credential(
                        currentUser.email,
                        currentPassword
                    );

                await reauthenticateWithCredential(
                    currentUser,
                    credential
                );

                // ---------------------------------------------
                // UPDATE PASSWORD
                // ---------------------------------------------

                await updatePassword(
                    currentUser,
                    newPassword
                );

                // ---------------------------------------------
                // CLEAR FORM
                // ---------------------------------------------

                setCurrentPassword("");

                setNewPassword("");

                setConfirmPassword("");

                setSuccessMessage(
                    "Password changed successfully."
                );
            } catch (error: any) {
                console.error(
                    "Change password error:",
                    error
                );

                // ---------------------------------------------
                // FIREBASE ERROR
                // ---------------------------------------------

                if (
                    error?.code ===
                    "auth/invalid-credential"
                ) {
                    setErrorMessage(
                        "Current password is incorrect."
                    );
                } else if (
                    error?.code ===
                    "auth/wrong-password"
                ) {
                    setErrorMessage(
                        "Current password is incorrect."
                    );
                } else if (
                    error?.code ===
                    "auth/weak-password"
                ) {
                    setErrorMessage(
                        "Password is too weak. Use at least 6 characters."
                    );
                } else if (
                    error?.code ===
                    "auth/requires-recent-login"
                ) {
                    setErrorMessage(
                        "For security, please log in again and then change your password."
                    );
                } else {
                    setErrorMessage(
                        "Failed to change password. Please try again."
                    );
                }
            } finally {
                setChangingPassword(false);
            }
        };

    // ===================================================
    // RETURN
    // ===================================================

    return (
        <AdminLayout>
            <div className="container-fluid p-4">

                {/* =================================================
            PAGE HEADER
        ================================================= */}

                <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>
                        <h3 className="fw-bold mb-1">
                            ⚙️ Settings
                        </h3>

                        <p className="text-muted mb-0">
                            Manage your profile and account settings
                        </p>
                    </div>

                </div>

                {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

                {successMessage && (
                    <div
                        className="alert alert-success alert-dismissible fade show"
                        role="alert"
                    >
                        ✅ {successMessage}

                        <button
                            type="button"
                            className="btn-close"
                            onClick={() =>
                                setSuccessMessage("")
                            }
                        />
                    </div>
                )}

                {/* =================================================
            ERROR MESSAGE
        ================================================= */}

                {errorMessage && (
                    <div
                        className="alert alert-danger alert-dismissible fade show"
                        role="alert"
                    >
                        ⚠️ {errorMessage}

                        <button
                            type="button"
                            className="btn-close"
                            onClick={() =>
                                setErrorMessage("")
                            }
                        />
                    </div>
                )}

                {loadingProfile ? (
                    <div className="text-center py-5">

                        <div
                            className="spinner-border text-primary"
                            role="status"
                        />

                        <p className="text-muted mt-3">
                            Loading profile...
                        </p>

                    </div>
                ) : (
                    <div className="row g-4">

                        {/* =================================================
                PROFILE SETTINGS
            ================================================= */}

                        <div className="col-lg-7">

                            <div className="card border-0 shadow-sm">

                                <div className="card-header bg-white p-3">

                                    <h5 className="mb-0 fw-bold">
                                        👤 Profile Settings
                                    </h5>

                                </div>

                                <div className="card-body p-4">

                                    {/* =========================================
                      PROFILE PHOTO
                  ========================================= */}

                                    <div className="text-center mb-4">

                                        <div
                                            className="position-relative d-inline-block"
                                        >

                                            {photoPreview ? (
                                                <img
                                                    src={photoPreview}
                                                    alt="Profile"
                                                    className="rounded-circle shadow-sm"
                                                    style={{
                                                        width: "140px",
                                                        height: "140px",
                                                        objectFit: "cover",
                                                        border:
                                                            "4px solid #fff",
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center shadow-sm"
                                                    style={{
                                                        width: "140px",
                                                        height: "140px",
                                                        fontSize: "55px",
                                                        border:
                                                            "4px solid #fff",
                                                    }}
                                                >
                                                    👤
                                                </div>
                                            )}

                                        </div>

                                        <div className="mt-3">

                                            <label
                                                htmlFor="profilePhoto"
                                                className="btn btn-outline-primary"
                                            >
                                                📷 Change Picture
                                            </label>

                                            <input
                                                id="profilePhoto"
                                                type="file"
                                                accept="image/*"
                                                className="d-none"
                                                onChange={
                                                    handlePhotoSelect
                                                }
                                            />

                                        </div>

                                        <small className="text-muted d-block mt-2">
                                            JPG, PNG or WEBP · Maximum 5MB
                                        </small>

                                    </div>

                                    {/* =========================================
                      NAME
                  ========================================= */}

                                    <div className="mb-3">

                                        <label className="form-label fw-semibold">
                                            Full Name
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            value={name}
                                            onChange={(e) =>
                                                setName(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter your name"
                                        />

                                    </div>

                                    {/* =========================================
                      DESIGNATION
                  ========================================= */}

                                    {/* =========================================
    DESIGNATION
========================================= */}

                                    <div className="mb-3">

                                        <label className="form-label fw-semibold">
                                            Designation
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control bg-light"
                                            value={designation}
                                            disabled
                                            readOnly
                                        />



                                    </div>
                                    {/* =========================================
                      PHONE
                  ========================================= */}

                                    <div className="mb-3">

                                        <label className="form-label fw-semibold">
                                            Phone
                                        </label>

                                        <input
                                            type="tel"
                                            className="form-control"
                                            value={phone}
                                            onChange={(e) =>
                                                setPhone(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter phone number"
                                        />

                                    </div>

                                    {/* =========================================
                      EMAIL
                  ========================================= */}

                                    <div className="mb-3">

                                        <label className="form-label fw-semibold">
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            className="form-control"
                                            value={
                                                profile?.email ||
                                                auth.currentUser?.email ||
                                                ""
                                            }
                                            disabled
                                        />

                                        <small className="text-muted">
                                            Admin can change Email
                                        </small>

                                    </div>

                                    {/* =========================================
                      BLOOD GROUP
                  ========================================= */}

                                    <div className="mb-3">

                                        <label className="form-label fw-semibold">
                                            Blood Group
                                        </label>

                                        <select
                                            className="form-select"
                                            value={bloodGroup}
                                            onChange={(e) =>
                                                setBloodGroup(
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                Select Blood Group
                                            </option>

                                            <option value="A+">
                                                A+
                                            </option>

                                            <option value="A-">
                                                A-
                                            </option>

                                            <option value="B+">
                                                B+
                                            </option>

                                            <option value="B-">
                                                B-
                                            </option>

                                            <option value="AB+">
                                                AB+
                                            </option>

                                            <option value="AB-">
                                                AB-
                                            </option>

                                            <option value="O+">
                                                O+
                                            </option>

                                            <option value="O-">
                                                O-
                                            </option>
                                        </select>

                                    </div>

                                    {/* =========================================
                      DATE OF BIRTH
                  ========================================= */}

                                    <div className="mb-4">

                                        <label className="form-label fw-semibold">
                                            Date of Birth
                                        </label>

                                        <input
                                            type="date"
                                            className="form-control"
                                            value={dateOfBirth}
                                            onChange={(e) =>
                                                setDateOfBirth(
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>

                                    {/* =========================================
                      UPDATE BUTTON
                  ========================================= */}

                                    <button
                                        type="button"
                                        className="btn btn-primary w-100"
                                        onClick={
                                            handleUpdateProfile
                                        }
                                        disabled={
                                            savingProfile ||
                                            uploadingPhoto
                                        }
                                    >
                                        {savingProfile ||
                                            uploadingPhoto ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                />

                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                💾 Update Profile
                                            </>
                                        )}
                                    </button>

                                </div>

                            </div>

                        </div>

                        {/* =================================================
                PASSWORD
            ================================================= */}

                        <div className="col-lg-5">

                            <div className="card border-0 shadow-sm">

                                <div className="card-header bg-white p-3">

                                    <h5 className="mb-0 fw-bold">
                                        🔐 Change Password
                                    </h5>

                                </div>

                                <div className="card-body p-4">

                                    <div className="alert alert-info">
                                        <small>
                                            For security, you need to enter
                                            your current password before
                                            setting a new password.
                                        </small>
                                    </div>

                                    {/* =========================================
                      CURRENT PASSWORD
                  ========================================= */}

                                    <div className="mb-3">

                                        <label className="form-label fw-semibold">
                                            Current Password
                                        </label>

                                        <div className="input-group">

                                            <input
                                                type={
                                                    showCurrentPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                className="form-control"
                                                value={
                                                    currentPassword
                                                }
                                                onChange={(e) =>
                                                    setCurrentPassword(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Enter current password"
                                            />

                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() =>
                                                    setShowCurrentPassword(
                                                        !showCurrentPassword
                                                    )
                                                }
                                            >
                                                {showCurrentPassword
                                                    ? "🙈"
                                                    : "👁️"}
                                            </button>

                                        </div>

                                    </div>

                                    {/* =========================================
                      NEW PASSWORD
                  ========================================= */}

                                    <div className="mb-3">

                                        <label className="form-label fw-semibold">
                                            New Password
                                        </label>

                                        <div className="input-group">

                                            <input
                                                type={
                                                    showNewPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                className="form-control"
                                                value={
                                                    newPassword
                                                }
                                                onChange={(e) =>
                                                    setNewPassword(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Enter new password"
                                            />

                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() =>
                                                    setShowNewPassword(
                                                        !showNewPassword
                                                    )
                                                }
                                            >
                                                {showNewPassword
                                                    ? "🙈"
                                                    : "👁️"}
                                            </button>

                                        </div>

                                        <small className="text-muted">
                                            Minimum 6 characters
                                        </small>

                                    </div>

                                    {/* =========================================
                      CONFIRM PASSWORD
                  ========================================= */}

                                    <div className="mb-4">

                                        <label className="form-label fw-semibold">
                                            Confirm New Password
                                        </label>

                                        <div className="input-group">

                                            <input
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                className="form-control"
                                                value={
                                                    confirmPassword
                                                }
                                                onChange={(e) =>
                                                    setConfirmPassword(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Confirm new password"
                                            />

                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword
                                                    )
                                                }
                                            >
                                                {showConfirmPassword
                                                    ? "🙈"
                                                    : "👁️"}
                                            </button>

                                        </div>

                                    </div>

                                    {/* =========================================
                      CHANGE PASSWORD BUTTON
                  ========================================= */}

                                    <button
                                        type="button"
                                        className="btn btn-danger w-100"
                                        onClick={
                                            handleChangePassword
                                        }
                                        disabled={
                                            changingPassword
                                        }
                                    >
                                        {changingPassword ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                />

                                                Changing Password...
                                            </>
                                        ) : (
                                            <>
                                                🔐 Change Password
                                            </>
                                        )}
                                    </button>

                                </div>

                            </div>

                            {/* =================================================
                  ACCOUNT INFORMATION
              ================================================= */}

                            <div className="card border-0 shadow-sm mt-4">

                                <div className="card-body p-4">

                                    <h6 className="fw-bold mb-3">
                                        🛡️ Account Security
                                    </h6>

                                    <div className="d-flex justify-content-between align-items-center mb-2">

                                        <span className="text-muted">
                                            Authentication
                                        </span>

                                        <span className="badge bg-success">
                                            Active
                                        </span>

                                    </div>

                                    <div className="d-flex justify-content-between align-items-center">

                                        <span className="text-muted">
                                            Account Email
                                        </span>

                                        <small className="text-muted text-break ms-3">
                                            {auth.currentUser?.email ||
                                                "N/A"}
                                        </small>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>
                )}

            </div>
        </AdminLayout>
    );
};

export default Settings;