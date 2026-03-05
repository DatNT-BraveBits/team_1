import { useRef, useCallback, useState } from "react";
import { useFetcher } from "react-router";

const MAX_IMAGES = 6;

export default function MultiImageUpload({ images, onChange }) {
  const fileInputRef = useRef(null);
  const dragIndexRef = useRef(null);
  const [removingIndex, setRemovingIndex] = useState(null);
  const bgFetcher = useFetcher();

  const isRemoving = bgFetcher.state !== "idle";

  // Handle bg removal result
  if (bgFetcher.data?.bgResult && removingIndex !== null && !isRemoving) {
    const dataUrl = bgFetcher.data.bgResult;
    const updated = [...images];
    if (updated[removingIndex]) {
      URL.revokeObjectURL(updated[removingIndex].previewUrl);
      updated[removingIndex] = {
        ...updated[removingIndex],
        previewUrl: dataUrl,
        bgRemoved: true,
      };
      onChange(updated);
    }
    bgFetcher.data.bgResult = null;
    setRemovingIndex(null);
  }

  const handleRemoveBg = useCallback(
    async (index) => {
      const img = images[index];
      if (!img) return;
      setRemovingIndex(index);

      const fd = new FormData();
      fd.append("_action", "removeBg");

      // Convert previewUrl (blob or data url) to file
      const res = await fetch(img.previewUrl);
      const blob = await res.blob();
      fd.append("imageFile", new File([blob], "image.png", { type: blob.type || "image/png" }));

      bgFetcher.submit(fd, { method: "POST", encType: "multipart/form-data" });
    },
    [images, bgFetcher],
  );

  const addFiles = useCallback(
    (fileList) => {
      const newImages = [...images];
      for (const file of fileList) {
        if (newImages.length >= MAX_IMAGES) break;
        if (!file.type.startsWith("image/")) continue;
        newImages.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          previewUrl: URL.createObjectURL(file),
        });
      }
      onChange(newImages);
    },
    [images, onChange],
  );

  const removeImage = useCallback(
    (index) => {
      const updated = [...images];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      onChange(updated);
    },
    [images, onChange],
  );

  const moveImage = useCallback(
    (from, to) => {
      if (to < 0 || to >= images.length) return;
      const updated = [...images];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      onChange(updated);
    },
    [images, onChange],
  );

  const handleDragStart = (e, index) => {
    dragIndexRef.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragIndexRef.current === null || dragIndexRef.current === index) return;
    moveImage(dragIndexRef.current, index);
    dragIndexRef.current = index;
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
        }}
      >
        {images.map((img, i) => (
          <div
            key={img.id}
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragEnd={handleDragEnd}
            style={{
              position: "relative",
              aspectRatio: "1",
              borderRadius: "10px",
              overflow: "hidden",
              border: "2px solid #e1e3e5",
              cursor: "grab",
              backgroundColor: "#f6f6f7",
            }}
          >
            <img
              src={img.previewUrl}
              alt={`Image ${i + 1}`}
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "6px",
                left: "6px",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                backgroundColor: "#2c6ecb",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              {i + 1}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeImage(i);
              }}
              style={closeBtnStyle}
            >
              &times;
            </button>
            {!img.bgRemoved && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveBg(i);
                }}
                disabled={isRemoving}
                style={{
                  position: "absolute",
                  top: "6px",
                  left: "34px",
                  padding: "2px 6px",
                  fontSize: "9px",
                  fontWeight: 700,
                  border: "none",
                  borderRadius: "4px",
                  backgroundColor: isRemoving && removingIndex === i ? "#6d7175" : "rgba(0,0,0,0.55)",
                  color: "#fff",
                  cursor: isRemoving ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {isRemoving && removingIndex === i ? "..." : "Remove BG"}
              </button>
            )}
            {isRemoving && removingIndex === i && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(255,255,255,0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    border: "3px solid #e1e3e5",
                    borderTop: "3px solid #2c6ecb",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}
            <div
              style={{
                position: "absolute",
                bottom: "6px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "4px",
              }}
            >
              {i > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveImage(i, i - 1);
                  }}
                  style={arrowBtnStyle}
                >
                  &#8249;
                </button>
              )}
              {i < images.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveImage(i, i + 1);
                  }}
                  style={arrowBtnStyle}
                >
                  &#8250;
                </button>
              )}
            </div>
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              aspectRatio: "1",
              borderRadius: "10px",
              border: "2px dashed #c9cccf",
              backgroundColor: "#fafbfb",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              color: "#8c9196",
            }}
          >
            <span style={{ fontSize: "28px", lineHeight: 1 }}>+</span>
            <span style={{ fontSize: "11px" }}>Add image</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
        style={{ display: "none" }}
      />

      {bgFetcher.data?.bgError && (
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "#fff4f4",
            border: "1px solid #e0b3b2",
            borderRadius: "8px",
            color: "#c4272c",
            fontSize: "12px",
          }}
        >
          Remove background failed: {bgFetcher.data.bgError}
        </div>
      )}

      <p style={{ margin: 0, fontSize: "12px", color: "#8c9196" }}>
        {images.length}/{MAX_IMAGES} images &middot; Drag to reorder &middot;
        Images play in order from 1 to {images.length || "N"}
      </p>
    </div>
  );
}

const closeBtnStyle = {
  position: "absolute",
  top: "6px",
  right: "6px",
  width: "22px",
  height: "22px",
  borderRadius: "50%",
  border: "none",
  backgroundColor: "rgba(0,0,0,0.55)",
  color: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  lineHeight: 1,
  padding: 0,
};

const arrowBtnStyle = {
  ...closeBtnStyle,
  top: "auto",
  right: "auto",
  fontSize: "16px",
};
