import tensorflow as tf
import numpy as np
from PIL import Image
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "rock_bee_model.h5")

model = tf.keras.models.load_model(MODEL_PATH)

IMG_SIZE = (224, 224)

def preprocess_image(image_file):
    img = Image.open(image_file.file).convert("RGB")
    img = img.resize((224, 224))
    img = np.array(img, dtype=np.float32)

    # Use MobileNetV2's official preprocessing (matches the new training script)
    img = tf.keras.applications.mobilenet_v2.preprocess_input(img)
    img = np.expand_dims(img, axis=0)

    return img



def predict(image_file):
    img = preprocess_image(image_file)

    # model.predict returns [[not_rock_bee_prob, rock_bee_prob]]
    # Based on training data: {'not_rock_bee': 0, 'rock_bee': 1}
    predictions = model.predict(img)[0]
    
    # Get the index with the highest probability
    best_index = np.argmax(predictions)
    confidence = float(predictions[best_index])

    if best_index == 1: # rock_bee index
        if confidence >= 0.7:
            label = "Rock Bee"
            status = "confirmed"
        else:
            label = "Possible Rock Bee"
            status = "manual_review"
    else: # not_rock_bee index
        label = "Not Rock Bee"
        status = "negative"

    return label, confidence, status
