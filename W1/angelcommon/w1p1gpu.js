"use strict";
window.onload = function () { main();} 

async function main() {
  console.log(navigator);
  const gpu = navigator.gpu;
  console.log(gpu.requestAdapter());
  const adapter = await gpu.requestAdapter();
  const device = await adapter.requestAdapter();
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("gpupresent") || canvas.getContext("webgpu");
  const canvasFormat = navigator.gpu.getPrefferedCanvasFormat();
  context.configure({
    device: device,
    format: canvasFormat,
  });

  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      loadOp: "clear",
      clearValue: {r: 1.0, g: 0.0, b: 0.0, a: 1.0 },
      storeOp: "store",
    }]
  });
  pass.end()
  device.queue.submit([encoder.finish()]);

}
