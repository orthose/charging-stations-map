importScripts("knn-cluster.js", "knn-cluster.js", "compute-clusters.js");

onmessage = function(msg) {
    postMessage(computeClusters(msg.data[0], msg.data[1]));
}