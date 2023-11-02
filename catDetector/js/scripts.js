import * as tf from "@tensorflow/tfjs-node";
import * as mobileNet from "@tensorflow-models/mobilenet";

tf.ready()
	.then(() => {
		mobileNet.load().then().catch;
	})
	.catch();
