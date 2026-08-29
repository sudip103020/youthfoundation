import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";

import { db } from "../firebase/firebase";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";



interface Activity {
  id: string;
  title: string;
  titleBn?: string;
  date: string;
  dateBn?: string;
  description: string;
  descriptionBn?: string;
  images: string[];
  createdAt?: any;
}

const Activities = () => {
  //==========================
  // Form State
  //==========================

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [dateBn, setDateBn] = useState("");
  const [descriptionBn, setDescriptionBn] = useState("");

  //==========================
  // Images
  //==========================

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [oldImages, setOldImages] = useState<string[]>([]);

  //==========================
  // Activity List
  //==========================

  const [activities, setActivities] = useState<Activity[]>([]);

  //==========================
  // Edit
  //==========================

  const [editingId, setEditingId] = useState("");

  //==========================
  // Load Activities
  //==========================

  const fetchActivities = async () => {
    const q = query(
      collection(db, "activities"),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    const data: Activity[] = [];

    snapshot.forEach((docItem) => {
      data.push({
        id: docItem.id,
        ...(docItem.data() as Omit<Activity, "id">),
      });
    });

    setActivities(data);
  };

  useEffect(() => {
    fetchActivities();
  }, []);
  //==========================
  // Select Images
  //==========================

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    setSelectedImages((prev) => [...prev, ...files]);

    const previews = files.map((file) => URL.createObjectURL(file));

    setPreviewImages((prev) => [...prev, ...previews]);
  };

  //==========================
  // Remove Preview Image
  //==========================

  const removePreviewImage = (index: number) => {
    URL.revokeObjectURL(previewImages[index]);

    const files = [...selectedImages];
    files.splice(index, 1);
    setSelectedImages(files);

    const previews = [...previewImages];
    previews.splice(index, 1);
    setPreviewImages(previews);
  };

  //==========================
  // Remove Old Image
  //==========================

  const removeOldImage = (index: number) => {
    const data = [...oldImages];

    data.splice(index, 1);

    setOldImages(data);
  };

  //==========================
  // Clear Form
  //==========================

  const clearForm = () => {
    previewImages.forEach((url) => URL.revokeObjectURL(url));

    setTitle("");
    setTitleBn("");
    setDate("");
    setDateBn("");
    setDescription("");
    setDescriptionBn("");

    setSelectedImages([]);
    setPreviewImages([]);
    setOldImages([]);

    setEditingId("");
  };

  //==========================
  // Upload Images
  //==========================

  //==========================
  // Cloudinary Upload Images
  //==========================

  const CLOUD_NAME = "dvpfixfd";
  const UPLOAD_PRESET = "badokhali_youth_foundation";


  const uploadImages = async () => {

    const urls: string[] = [];

    for (const file of selectedImages) {

      const formData = new FormData();

      formData.append("file", file);

      formData.append(
        "upload_preset",
        UPLOAD_PRESET
      );

      formData.append(
        "folder",
        "badokhali_youth_foundation/activities"
      );


      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );


      const data = await response.json();


      if (data.secure_url) {
        urls.push(data.secure_url);
      }

    }

    return urls;

  };
  //==========================
  // Add Activity
  //==========================

  const addActivity = async () => {
    if (!title || !date || !description) {
      alert("সব তথ্য পূরণ করুন");
      return;
    }

    if (selectedImages.length === 0) {
      alert("কমপক্ষে একটি ছবি নির্বাচন করুন");
      return;
    }

    try {
      const imageUrls = await uploadImages();

      await addDoc(collection(db, "activities"), {
        title,
        titleBn,
        date,
        dateBn,
        description,
        descriptionBn,
        images: imageUrls,
        createdAt: serverTimestamp(),
      });

      alert("Activity Added Successfully");

      clearForm();

      fetchActivities();
    } catch (error) {
      console.error(error);
      alert("Failed to Add Activity");
    }
  };

  //==========================
  // Edit Activity
  //==========================

  const handleEdit = (item: Activity) => {
    setEditingId(item.id);

    setTitle(item.title);
    setDate(item.date);
    setDescription(item.description);
    setTitleBn(item.titleBn || "");
    setDateBn(item.dateBn || "");
    setDescriptionBn(item.descriptionBn || "");

    setOldImages(item.images);

    setSelectedImages([]);
    setPreviewImages([]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  //==========================
  // Update Activity
  //==========================

  const updateActivity = async () => {
    if (!editingId) return;

    if (!title || !date || !description) {
      alert("সব তথ্য পূরণ করুন");
      return;
    }

    try {
      let imageUrls = [...oldImages];

      if (selectedImages.length > 0) {
        const newImages = await uploadImages();

        imageUrls = [...imageUrls, ...newImages];
      }

      await updateDoc(doc(db, "activities", editingId), {
        title,
        titleBn,

        date,
        dateBn,

        description,
        descriptionBn,

        images: imageUrls,
      });

      alert("Activity Updated Successfully");

      clearForm();

      fetchActivities();
    } catch (error) {
      console.error(error);

      alert("Update Failed");
    }
  };

  //==========================
  // Delete Activity
  //==========================

  const handleDelete = async (item: Activity) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this activity?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "activities", item.id));

      alert("Activity Deleted Successfully");

      fetchActivities();
    } catch (error) {
      console.error(error);

      alert("Delete Failed");
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid p-4">

        <div className="card shadow-sm p-3 mb-4">

          <h4 className="mb-4">
            {editingId ? "✏️ Edit Activity" : "➕ Add Activity"}
          </h4>

          <div className="row">

            {/* Title */}

            <div className="col-md-6 mb-3">
              <label className="form-label">
                Activity Title
              </label>

              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Activity Title"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Title (বাংলা)
              </label>

              <input
                type="text"
                className="form-control"
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="বাংলায় শিরোনাম লিখুন"
              />
            </div>

            {/* Date */}

            <div className="col-md-6 mb-3">
              <label className="form-label">
                Date / Month
              </label>

              <input
                type="text"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="August 2026"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Date (বাংলা)
              </label>

              <input
                type="text"
                className="form-control"
                value={dateBn}
                onChange={(e) => setDateBn(e.target.value)}
                placeholder="যেমন: ১৫ আগস্ট ২০২৬"
              />
            </div>

            {/* Description */}

            <div className="col-12 mb-3">
              <label className="form-label">
                Description
              </label>

              <textarea
                rows={5}
                className="form-control"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
              />
            </div>


            <div className="mb-3">
              <label className="form-label">
                Description (বাংলা)
              </label>

              <textarea
                className="form-control"
                rows={4}
                value={descriptionBn}
                onChange={(e) => setDescriptionBn(e.target.value)}
                placeholder="বাংলায় বিবরণ লিখুন"
              />
            </div>

            {/* Images */}

            <div className="col-12 mb-3">
              <label className="form-label">
                Select Images
              </label>

              <input
                type="file"
                multiple
                accept="image/*"
                className="form-control"
                onChange={handleImageChange}
              />
            </div>

          </div>

          {/* New Preview */}

          {previewImages.length > 0 && (

            <div className="mb-4">

              <h6>New Images</h6>

              <div className="row">

                {previewImages.map((image, index) => (

                  <div
                    className="col-md-2 col-6 mb-3"
                    key={index}
                  >

                    <div className="card">

                      <img
                        src={image}
                        className="card-img-top"
                        style={{
                          height: "120px",
                          objectFit: "cover",
                        }}
                      />

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          removePreviewImage(index)
                        }
                      >
                        Remove
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}

          {/* Old Images */}

          {editingId && oldImages.length > 0 && (

            <div className="mb-4">

              <h6>Current Images</h6>

              <div className="row">

                {oldImages.map((image, index) => (

                  <div
                    className="col-md-2 col-6 mb-3"
                    key={index}
                  >

                    <div className="card">

                      <img
                        src={image}
                        className="card-img-top"
                        style={{
                          height: "120px",
                          objectFit: "cover",
                        }}
                      />

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          removeOldImage(index)
                        }
                      >
                        Remove
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          )}

          <div className="d-flex gap-2">

            {editingId ? (

              <button
                className="btn btn-warning"
                onClick={updateActivity}
              >
                💾 Update Activity
              </button>

            ) : (

              <button
                className="btn btn-success"
                onClick={addActivity}
              >
                ➕ Save Activity
              </button>

            )}

            {editingId && (

              <button
                className="btn btn-secondary"
                onClick={clearForm}
              >
                Cancel
              </button>

            )}

          </div>

        </div>

        {/* ==========================
          Activity List
      ========================== */}

        <div className="card shadow-sm">

          <div className="card-header bg-dark text-white">
            <h5 className="mb-0">
              📋 Activities
            </h5>
          </div>

          <div className="card-body">

            <div className="table-responsive">

              <table className="table table-bordered table-hover align-middle">

                <thead className="table-light">

                  <tr>

                    <th >#</th>

                    <th >Image</th>

                    <th>Title</th>

                    <th >Date</th>

                    <th>Description</th>

                    <th >Action</th>

                  </tr>

                </thead>

                <tbody>

                  {activities.length === 0 ? (

                    <tr>

                      <td
                        colSpan={6}
                        className="text-center text-muted"
                      >
                        No Activities Found
                      </td>

                    </tr>

                  ) : (

                    activities.map((item, index) => (

                      <tr key={item.id}>

                        <td>{index + 1}</td>

                        <td>

                          {item.images.length > 0 ? (

                            <img
                              src={item.images[0]}
                              alt={item.title}
                              style={{
                                width: "80px",
                                height: "80px",
                                objectFit: "cover",
                                borderRadius: "6px",
                              }}
                            />

                          ) : (

                            <span className="text-muted">
                              No Image
                            </span>

                          )}

                        </td>

                        <td>{item.title}</td>

                        <td>{item.date}</td>

                        <td>

                          <div
                            style={{
                              maxWidth: "350px",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {item.description}
                          </div>

                        </td>

                        <td>

                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={() => handleEdit(item)}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(item)}
                          >
                            🗑 Delete
                          </button>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </div>
    </AdminLayout>
  );

};

export default Activities;
