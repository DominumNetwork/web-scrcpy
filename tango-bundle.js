var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/yuv-buffer/yuv-buffer.js
var require_yuv_buffer = __commonJS({
  "node_modules/yuv-buffer/yuv-buffer.js"(exports, module) {
    var YUVBuffer = {
      /**
       * Validate a plane dimension
       * @param {number} dim - vertical or horizontal dimension
       * @throws exception on zero, negative, or non-integer value
       */
      validateDimension: function(dim) {
        if (dim <= 0 || dim !== (dim | 0)) {
          throw "YUV plane dimensions must be a positive integer";
        }
      },
      /**
       * Validate a plane offset
       * @param {number} dim - vertical or horizontal dimension
       * @throws exception on negative or non-integer value
       */
      validateOffset: function(dim) {
        if (dim < 0 || dim !== (dim | 0)) {
          throw "YUV plane offsets must be a non-negative integer";
        }
      },
      /**
       * Validate and fill out a YUVFormat object structure.
       *
       * At least width and height fields are required; other fields will be
       * derived if left missing or empty:
       * - chromaWidth and chromaHeight will be copied from width and height as for a 4:4:4 layout
       * - cropLeft and cropTop will be 0
       * - cropWidth and cropHeight will be set to whatever of the frame is visible after cropTop and cropLeft are applied
       * - displayWidth and displayHeight will be set to cropWidth and cropHeight.
       *
       * @param {YUVFormat} fields - input fields, must include width and height.
       * @returns {YUVFormat} - validated structure, with all derivable fields filled out.
       * @throws exception on invalid fields or missing width/height
       */
      format: function(fields) {
        var width = fields.width, height = fields.height, chromaWidth = fields.chromaWidth || width, chromaHeight = fields.chromaHeight || height, cropLeft = fields.cropLeft || 0, cropTop = fields.cropTop || 0, cropWidth = fields.cropWidth || width - cropLeft, cropHeight = fields.cropHeight || height - cropTop, displayWidth = fields.displayWidth || cropWidth, displayHeight = fields.displayHeight || cropHeight;
        this.validateDimension(width);
        this.validateDimension(height);
        this.validateDimension(chromaWidth);
        this.validateDimension(chromaHeight);
        this.validateOffset(cropLeft);
        this.validateOffset(cropTop);
        this.validateDimension(cropWidth);
        this.validateDimension(cropHeight);
        this.validateDimension(displayWidth);
        this.validateDimension(displayHeight);
        return {
          width,
          height,
          chromaWidth,
          chromaHeight,
          cropLeft,
          cropTop,
          cropWidth,
          cropHeight,
          displayWidth,
          displayHeight
        };
      },
      /**
       * Pick a suitable stride for a custom-allocated thingy
       * @param {number} width - width in bytes
       * @returns {number} - new width in bytes at least as large
       * @throws exception on invalid input width
       */
      suitableStride: function(width) {
        YUVBuffer.validateDimension(width);
        var alignment = 4, remainder = width % alignment;
        if (remainder == 0) {
          return width;
        } else {
          return width + (alignment - remainder);
        }
      },
      /**
       * Allocate or extract a YUVPlane object from given dimensions/source.
       * @param {number} width - width in pixels
       * @param {number} height - height in pixels
       * @param {Uint8Array} source - input byte array; optional (will create empty buffer if missing)
       * @param {number} stride - row length in bytes; optional (will create a default if missing)
       * @param {number} offset - offset into source array to extract; optional (will start at 0 if missing)
       * @returns {YUVPlane} - freshly allocated planar buffer
       */
      allocPlane: function(width, height, source, stride, offset) {
        var size, bytes;
        this.validateDimension(width);
        this.validateDimension(height);
        offset = offset || 0;
        stride = stride || this.suitableStride(width);
        this.validateDimension(stride);
        if (stride < width) {
          throw "Invalid input stride for YUV plane; must be larger than width";
        }
        size = stride * height;
        if (source) {
          if (source.length - offset < size) {
            throw "Invalid input buffer for YUV plane; must be large enough for stride times height";
          }
          bytes = source.slice(offset, offset + size);
        } else {
          bytes = new Uint8Array(size);
          stride = stride || this.suitableStride(width);
        }
        return {
          bytes,
          stride
        };
      },
      /**
       * Allocate a new YUVPlane object big enough for a luma plane in the given format
       * @param {YUVFormat} format - target frame format
       * @param {Uint8Array} source - input byte array; optional (will create empty buffer if missing)
       * @param {number} stride - row length in bytes; optional (will create a default if missing)
       * @param {number} offset - offset into source array to extract; optional (will start at 0 if missing)
       * @returns {YUVPlane} - freshly allocated planar buffer
       */
      lumaPlane: function(format, source, stride, offset) {
        return this.allocPlane(format.width, format.height, source, stride, offset);
      },
      /**
       * Allocate a new YUVPlane object big enough for a chroma plane in the given format,
       * optionally copying data from an existing buffer.
       *
       * @param {YUVFormat} format - target frame format
       * @param {Uint8Array} source - input byte array; optional (will create empty buffer if missing)
       * @param {number} stride - row length in bytes; optional (will create a default if missing)
       * @param {number} offset - offset into source array to extract; optional (will start at 0 if missing)
       * @returns {YUVPlane} - freshly allocated planar buffer
       */
      chromaPlane: function(format, source, stride, offset) {
        return this.allocPlane(format.chromaWidth, format.chromaHeight, source, stride, offset);
      },
      /**
       * Allocate a new YUVFrame object big enough for the given format
       * @param {YUVFormat} format - target frame format
       * @param {YUVPlane} y - optional Y plane; if missing, fresh one will be allocated
       * @param {YUVPlane} u - optional U plane; if missing, fresh one will be allocated
       * @param {YUVPlane} v - optional V plane; if missing, fresh one will be allocated
       * @returns {YUVFrame} - freshly allocated frame buffer
       */
      frame: function(format, y, u, v) {
        y = y || this.lumaPlane(format);
        u = u || this.chromaPlane(format);
        v = v || this.chromaPlane(format);
        return {
          format,
          y,
          u,
          v
        };
      },
      /**
       * Duplicate a plane using new buffer memory.
       * @param {YUVPlane} plane - input plane to copy
       * @returns {YUVPlane} - freshly allocated and filled planar buffer
       */
      copyPlane: function(plane) {
        return {
          bytes: plane.bytes.slice(),
          stride: plane.stride
        };
      },
      /**
       * Duplicate a frame using new buffer memory.
       * @param {YUVFrame} frame - input frame to copyFrame
       * @returns {YUVFrame} - freshly allocated and filled frame buffer
       */
      copyFrame: function(frame) {
        return {
          format: frame.format,
          y: this.copyPlane(frame.y),
          u: this.copyPlane(frame.u),
          v: this.copyPlane(frame.v)
        };
      },
      /**
       * List the backing buffers for the frame's planes for transfer between
       * threads via Worker.postMessage.
       * @param {YUVFrame} frame - input frame
       * @returns {Array} - list of transferable objects
       */
      transferables: function(frame) {
        return [frame.y.bytes.buffer, frame.u.bytes.buffer, frame.v.bytes.buffer];
      }
    };
    module.exports = YUVBuffer;
  }
});

// node_modules/yuv-canvas/src/FrameSink.js
var require_FrameSink = __commonJS({
  "node_modules/yuv-canvas/src/FrameSink.js"(exports, module) {
    (function() {
      "use strict";
      function FrameSink(canvas, options) {
        throw new Error("abstract");
      }
      FrameSink.prototype.drawFrame = function(buffer2) {
        throw new Error("abstract");
      };
      FrameSink.prototype.clear = function() {
        throw new Error("abstract");
      };
      module.exports = FrameSink;
    })();
  }
});

// node_modules/yuv-canvas/src/depower.js
var require_depower = __commonJS({
  "node_modules/yuv-canvas/src/depower.js"(exports, module) {
    (function() {
      "use strict";
      function depower(ratio) {
        var shiftCount = 0, n = ratio >> 1;
        while (n != 0) {
          n = n >> 1;
          shiftCount++;
        }
        if (ratio !== 1 << shiftCount) {
          throw "chroma plane dimensions must be power of 2 ratio to luma plane dimensions; got " + ratio;
        }
        return shiftCount;
      }
      module.exports = depower;
    })();
  }
});

// node_modules/yuv-canvas/src/YCbCr.js
var require_YCbCr = __commonJS({
  "node_modules/yuv-canvas/src/YCbCr.js"(exports, module) {
    (function() {
      "use strict";
      var depower = require_depower();
      function convertYCbCr(buffer2, output) {
        var width = buffer2.format.width | 0, height = buffer2.format.height | 0, hdec = depower(buffer2.format.width / buffer2.format.chromaWidth) | 0, vdec = depower(buffer2.format.height / buffer2.format.chromaHeight) | 0, bytesY = buffer2.y.bytes, bytesCb = buffer2.u.bytes, bytesCr = buffer2.v.bytes, strideY = buffer2.y.stride | 0, strideCb = buffer2.u.stride | 0, strideCr = buffer2.v.stride | 0, outStride = width << 2, YPtr = 0, Y0Ptr = 0, Y1Ptr = 0, CbPtr = 0, CrPtr = 0, outPtr = 0, outPtr0 = 0, outPtr1 = 0, colorCb = 0, colorCr = 0, multY = 0, multCrR = 0, multCbCrG = 0, multCbB = 0, x = 0, y = 0, xdec = 0, ydec = 0;
        if (hdec == 1 && vdec == 1) {
          outPtr0 = 0;
          outPtr1 = outStride;
          ydec = 0;
          for (y = 0; y < height; y += 2) {
            Y0Ptr = y * strideY | 0;
            Y1Ptr = Y0Ptr + strideY | 0;
            CbPtr = ydec * strideCb | 0;
            CrPtr = ydec * strideCr | 0;
            for (x = 0; x < width; x += 2) {
              colorCb = bytesCb[CbPtr++] | 0;
              colorCr = bytesCr[CrPtr++] | 0;
              multCrR = (409 * colorCr | 0) - 57088 | 0;
              multCbCrG = (100 * colorCb | 0) + (208 * colorCr | 0) - 34816 | 0;
              multCbB = (516 * colorCb | 0) - 70912 | 0;
              multY = 298 * bytesY[Y0Ptr++] | 0;
              output[outPtr0] = multY + multCrR >> 8;
              output[outPtr0 + 1] = multY - multCbCrG >> 8;
              output[outPtr0 + 2] = multY + multCbB >> 8;
              outPtr0 += 4;
              multY = 298 * bytesY[Y0Ptr++] | 0;
              output[outPtr0] = multY + multCrR >> 8;
              output[outPtr0 + 1] = multY - multCbCrG >> 8;
              output[outPtr0 + 2] = multY + multCbB >> 8;
              outPtr0 += 4;
              multY = 298 * bytesY[Y1Ptr++] | 0;
              output[outPtr1] = multY + multCrR >> 8;
              output[outPtr1 + 1] = multY - multCbCrG >> 8;
              output[outPtr1 + 2] = multY + multCbB >> 8;
              outPtr1 += 4;
              multY = 298 * bytesY[Y1Ptr++] | 0;
              output[outPtr1] = multY + multCrR >> 8;
              output[outPtr1 + 1] = multY - multCbCrG >> 8;
              output[outPtr1 + 2] = multY + multCbB >> 8;
              outPtr1 += 4;
            }
            outPtr0 += outStride;
            outPtr1 += outStride;
            ydec++;
          }
        } else {
          outPtr = 0;
          for (y = 0; y < height; y++) {
            xdec = 0;
            ydec = y >> vdec;
            YPtr = y * strideY | 0;
            CbPtr = ydec * strideCb | 0;
            CrPtr = ydec * strideCr | 0;
            for (x = 0; x < width; x++) {
              xdec = x >> hdec;
              colorCb = bytesCb[CbPtr + xdec] | 0;
              colorCr = bytesCr[CrPtr + xdec] | 0;
              multCrR = (409 * colorCr | 0) - 57088 | 0;
              multCbCrG = (100 * colorCb | 0) + (208 * colorCr | 0) - 34816 | 0;
              multCbB = (516 * colorCb | 0) - 70912 | 0;
              multY = 298 * bytesY[YPtr++] | 0;
              output[outPtr] = multY + multCrR >> 8;
              output[outPtr + 1] = multY - multCbCrG >> 8;
              output[outPtr + 2] = multY + multCbB >> 8;
              outPtr += 4;
            }
          }
        }
      }
      module.exports = {
        convertYCbCr
      };
    })();
  }
});

// node_modules/yuv-canvas/src/SoftwareFrameSink.js
var require_SoftwareFrameSink = __commonJS({
  "node_modules/yuv-canvas/src/SoftwareFrameSink.js"(exports, module) {
    (function() {
      "use strict";
      var FrameSink = require_FrameSink(), YCbCr = require_YCbCr();
      function SoftwareFrameSink(canvas) {
        var self = this, ctx = canvas.getContext("2d"), imageData = null, resampleCanvas = null, resampleContext = null;
        function initImageData(width, height) {
          imageData = ctx.createImageData(width, height);
          var data = imageData.data, pixelCount = width * height * 4;
          for (var i = 0; i < pixelCount; i += 4) {
            data[i + 3] = 255;
          }
        }
        function initResampleCanvas(cropWidth, cropHeight) {
          resampleCanvas = document.createElement("canvas");
          resampleCanvas.width = cropWidth;
          resampleCanvas.height = cropHeight;
          resampleContext = resampleCanvas.getContext("2d");
        }
        self.drawFrame = function drawFrame(buffer2) {
          var format = buffer2.format;
          if (canvas.width !== format.displayWidth || canvas.height !== format.displayHeight) {
            canvas.width = format.displayWidth;
            canvas.height = format.displayHeight;
          }
          if (imageData === null || imageData.width != format.width || imageData.height != format.height) {
            initImageData(format.width, format.height);
          }
          YCbCr.convertYCbCr(buffer2, imageData.data);
          var resample = format.cropWidth != format.displayWidth || format.cropHeight != format.displayHeight;
          var drawContext;
          if (resample) {
            if (!resampleCanvas) {
              initResampleCanvas(format.cropWidth, format.cropHeight);
            }
            drawContext = resampleContext;
          } else {
            drawContext = ctx;
          }
          drawContext.putImageData(
            imageData,
            -format.cropLeft,
            -format.cropTop,
            // must offset the offset
            format.cropLeft,
            format.cropTop,
            format.cropWidth,
            format.cropHeight
          );
          if (resample) {
            ctx.drawImage(resampleCanvas, 0, 0, format.displayWidth, format.displayHeight);
          }
        };
        self.clear = function() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
        return self;
      }
      SoftwareFrameSink.prototype = Object.create(FrameSink.prototype);
      module.exports = SoftwareFrameSink;
    })();
  }
});

// node_modules/yuv-canvas/build/shaders.js
var require_shaders = __commonJS({
  "node_modules/yuv-canvas/build/shaders.js"(exports, module) {
    module.exports = {
      vertex: "precision mediump float;\n\nattribute vec2 aPosition;\nattribute vec2 aLumaPosition;\nattribute vec2 aChromaPosition;\nvarying vec2 vLumaPosition;\nvarying vec2 vChromaPosition;\nvoid main() {\n    gl_Position = vec4(aPosition, 0, 1);\n    vLumaPosition = aLumaPosition;\n    vChromaPosition = aChromaPosition;\n}\n",
      fragment: "// inspired by https://github.com/mbebenita/Broadway/blob/master/Player/canvas.js\n\nprecision mediump float;\n\nuniform sampler2D uTextureY;\nuniform sampler2D uTextureCb;\nuniform sampler2D uTextureCr;\nvarying vec2 vLumaPosition;\nvarying vec2 vChromaPosition;\nvoid main() {\n   // Y, Cb, and Cr planes are uploaded as ALPHA textures.\n   float fY = texture2D(uTextureY, vLumaPosition).w;\n   float fCb = texture2D(uTextureCb, vChromaPosition).w;\n   float fCr = texture2D(uTextureCr, vChromaPosition).w;\n\n   // Premultipy the Y...\n   float fYmul = fY * 1.1643828125;\n\n   // And convert that to RGB!\n   gl_FragColor = vec4(\n     fYmul + 1.59602734375 * fCr - 0.87078515625,\n     fYmul - 0.39176171875 * fCb - 0.81296875 * fCr + 0.52959375,\n     fYmul + 2.017234375   * fCb - 1.081390625,\n     1\n   );\n}\n",
      vertexStripe: "precision mediump float;\n\nattribute vec2 aPosition;\nattribute vec2 aTexturePosition;\nvarying vec2 vTexturePosition;\n\nvoid main() {\n    gl_Position = vec4(aPosition, 0, 1);\n    vTexturePosition = aTexturePosition;\n}\n",
      fragmentStripe: "// extra 'stripe' texture fiddling to work around IE 11's poor performance on gl.LUMINANCE and gl.ALPHA textures\n\nprecision mediump float;\n\nuniform sampler2D uStripe;\nuniform sampler2D uTexture;\nvarying vec2 vTexturePosition;\nvoid main() {\n   // Y, Cb, and Cr planes are mapped into a pseudo-RGBA texture\n   // so we can upload them without expanding the bytes on IE 11\n   // which doesn't allow LUMINANCE or ALPHA textures\n   // The stripe textures mark which channel to keep for each pixel.\n   // Each texture extraction will contain the relevant value in one\n   // channel only.\n\n   float fLuminance = dot(\n      texture2D(uStripe, vTexturePosition),\n      texture2D(uTexture, vTexturePosition)\n   );\n\n   gl_FragColor = vec4(0, 0, 0, fLuminance);\n}\n"
    };
  }
});

// node_modules/yuv-canvas/src/WebGLFrameSink.js
var require_WebGLFrameSink = __commonJS({
  "node_modules/yuv-canvas/src/WebGLFrameSink.js"(exports, module) {
    (function() {
      "use strict";
      var FrameSink = require_FrameSink(), shaders = require_shaders();
      function WebGLFrameSink(canvas) {
        var self = this, gl = WebGLFrameSink.contextForCanvas(canvas), debug = false;
        if (gl === null) {
          throw new Error("WebGL unavailable");
        }
        function checkError() {
          if (debug) {
            err = gl.getError();
            if (err !== 0) {
              throw new Error("GL error " + err);
            }
          }
        }
        function compileShader(type, source) {
          var shader = gl.createShader(type);
          gl.shaderSource(shader, source);
          gl.compileShader(shader);
          if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            var err2 = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error("GL shader compilation for " + type + " failed: " + err2);
          }
          return shader;
        }
        var program, unpackProgram, err;
        var rectangle = new Float32Array([
          // First triangle (top left, clockwise)
          -1,
          -1,
          1,
          -1,
          -1,
          1,
          // Second triangle (bottom right, clockwise)
          -1,
          1,
          1,
          -1,
          1,
          1
        ]);
        var textures = {};
        var framebuffers = {};
        var stripes = {};
        var buf, positionLocation, unpackPositionLocation;
        var unpackTexturePositionBuffer, unpackTexturePositionLocation;
        var stripeLocation, unpackTextureLocation;
        var lumaPositionBuffer, lumaPositionLocation;
        var chromaPositionBuffer, chromaPositionLocation;
        function createOrReuseTexture(name, formatUpdate) {
          if (!textures[name] || formatUpdate) {
            textures[name] = gl.createTexture();
          }
          return textures[name];
        }
        function uploadTexture(name, formatUpdate, width, height, data) {
          var create = !textures[name] || formatUpdate;
          var texture = createOrReuseTexture(name, formatUpdate);
          gl.activeTexture(gl.TEXTURE0);
          if (WebGLFrameSink.stripe) {
            var uploadTemp = !textures[name + "_temp"] || formatUpdate;
            var tempTexture = createOrReuseTexture(name + "_temp", formatUpdate);
            gl.bindTexture(gl.TEXTURE_2D, tempTexture);
            if (uploadTemp) {
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
              gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                // mip level
                gl.RGBA,
                // internal format
                width / 4,
                height,
                0,
                // border
                gl.RGBA,
                // format
                gl.UNSIGNED_BYTE,
                // type
                data
                // data!
              );
            } else {
              gl.texSubImage2D(
                gl.TEXTURE_2D,
                0,
                // mip level
                0,
                // x offset
                0,
                // y offset
                width / 4,
                height,
                gl.RGBA,
                // format
                gl.UNSIGNED_BYTE,
                // type
                data
                // data!
              );
            }
            var stripeTexture = textures[name + "_stripe"];
            var uploadStripe = !stripeTexture || formatUpdate;
            if (uploadStripe) {
              stripeTexture = createOrReuseTexture(name + "_stripe", formatUpdate);
            }
            gl.bindTexture(gl.TEXTURE_2D, stripeTexture);
            if (uploadStripe) {
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
              gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                // mip level
                gl.RGBA,
                // internal format
                width,
                1,
                0,
                // border
                gl.RGBA,
                // format
                gl.UNSIGNED_BYTE,
                //type
                buildStripe(width, 1)
                // data!
              );
            }
          } else {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            if (create) {
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
              gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                // mip level
                gl.ALPHA,
                // internal format
                width,
                height,
                0,
                // border
                gl.ALPHA,
                // format
                gl.UNSIGNED_BYTE,
                //type
                data
                // data!
              );
            } else {
              gl.texSubImage2D(
                gl.TEXTURE_2D,
                0,
                // mip level
                0,
                // x
                0,
                // y
                width,
                height,
                gl.ALPHA,
                // internal format
                gl.UNSIGNED_BYTE,
                //type
                data
                // data!
              );
            }
          }
        }
        function unpackTexture(name, formatUpdate, width, height) {
          var texture = textures[name];
          gl.useProgram(unpackProgram);
          var fb = framebuffers[name];
          if (!fb || formatUpdate) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texImage2D(
              gl.TEXTURE_2D,
              0,
              // mip level
              gl.RGBA,
              // internal format
              width,
              height,
              0,
              // border
              gl.RGBA,
              // format
              gl.UNSIGNED_BYTE,
              //type
              null
              // data!
            );
            fb = framebuffers[name] = gl.createFramebuffer();
          }
          gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
          var tempTexture = textures[name + "_temp"];
          gl.activeTexture(gl.TEXTURE1);
          gl.bindTexture(gl.TEXTURE_2D, tempTexture);
          gl.uniform1i(unpackTextureLocation, 1);
          var stripeTexture = textures[name + "_stripe"];
          gl.activeTexture(gl.TEXTURE2);
          gl.bindTexture(gl.TEXTURE_2D, stripeTexture);
          gl.uniform1i(stripeLocation, 2);
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.enableVertexAttribArray(positionLocation);
          gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ARRAY_BUFFER, unpackTexturePositionBuffer);
          gl.enableVertexAttribArray(unpackTexturePositionLocation);
          gl.vertexAttribPointer(unpackTexturePositionLocation, 2, gl.FLOAT, false, 0, 0);
          gl.viewport(0, 0, width, height);
          gl.drawArrays(gl.TRIANGLES, 0, rectangle.length / 2);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        function attachTexture(name, register, index) {
          gl.activeTexture(register);
          gl.bindTexture(gl.TEXTURE_2D, textures[name]);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.uniform1i(gl.getUniformLocation(program, name), index);
        }
        function buildStripe(width) {
          if (stripes[width]) {
            return stripes[width];
          }
          var len = width, out = new Uint32Array(len);
          for (var i = 0; i < len; i += 4) {
            out[i] = 255;
            out[i + 1] = 65280;
            out[i + 2] = 16711680;
            out[i + 3] = 4278190080;
          }
          return stripes[width] = new Uint8Array(out.buffer);
        }
        function initProgram(vertexShaderSource, fragmentShaderSource) {
          var vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
          var fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
          var program2 = gl.createProgram();
          gl.attachShader(program2, vertexShader);
          gl.attachShader(program2, fragmentShader);
          gl.linkProgram(program2);
          if (!gl.getProgramParameter(program2, gl.LINK_STATUS)) {
            var err2 = gl.getProgramInfoLog(program2);
            gl.deleteProgram(program2);
            throw new Error("GL program linking failed: " + err2);
          }
          return program2;
        }
        function init() {
          if (WebGLFrameSink.stripe) {
            unpackProgram = initProgram(shaders.vertexStripe, shaders.fragmentStripe);
            unpackPositionLocation = gl.getAttribLocation(unpackProgram, "aPosition");
            unpackTexturePositionBuffer = gl.createBuffer();
            var textureRectangle = new Float32Array([
              0,
              0,
              1,
              0,
              0,
              1,
              0,
              1,
              1,
              0,
              1,
              1
            ]);
            gl.bindBuffer(gl.ARRAY_BUFFER, unpackTexturePositionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, textureRectangle, gl.STATIC_DRAW);
            unpackTexturePositionLocation = gl.getAttribLocation(unpackProgram, "aTexturePosition");
            stripeLocation = gl.getUniformLocation(unpackProgram, "uStripe");
            unpackTextureLocation = gl.getUniformLocation(unpackProgram, "uTexture");
          }
          program = initProgram(shaders.vertex, shaders.fragment);
          buf = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.bufferData(gl.ARRAY_BUFFER, rectangle, gl.STATIC_DRAW);
          positionLocation = gl.getAttribLocation(program, "aPosition");
          lumaPositionBuffer = gl.createBuffer();
          lumaPositionLocation = gl.getAttribLocation(program, "aLumaPosition");
          chromaPositionBuffer = gl.createBuffer();
          chromaPositionLocation = gl.getAttribLocation(program, "aChromaPosition");
        }
        self.drawFrame = function(buffer2) {
          var format = buffer2.format;
          var formatUpdate = !program || canvas.width !== format.displayWidth || canvas.height !== format.displayHeight;
          if (formatUpdate) {
            canvas.width = format.displayWidth;
            canvas.height = format.displayHeight;
            self.clear();
          }
          if (!program) {
            init();
          }
          if (formatUpdate) {
            var setupTexturePosition = function(buffer3, location, texWidth) {
              var textureX0 = format.cropLeft / texWidth;
              var textureX1 = (format.cropLeft + format.cropWidth) / texWidth;
              var textureY0 = (format.cropTop + format.cropHeight) / format.height;
              var textureY1 = format.cropTop / format.height;
              var textureRectangle = new Float32Array([
                textureX0,
                textureY0,
                textureX1,
                textureY0,
                textureX0,
                textureY1,
                textureX0,
                textureY1,
                textureX1,
                textureY0,
                textureX1,
                textureY1
              ]);
              gl.bindBuffer(gl.ARRAY_BUFFER, buffer3);
              gl.bufferData(gl.ARRAY_BUFFER, textureRectangle, gl.STATIC_DRAW);
            };
            setupTexturePosition(
              lumaPositionBuffer,
              lumaPositionLocation,
              buffer2.y.stride
            );
            setupTexturePosition(
              chromaPositionBuffer,
              chromaPositionLocation,
              buffer2.u.stride * format.width / format.chromaWidth
            );
          }
          uploadTexture("uTextureY", formatUpdate, buffer2.y.stride, format.height, buffer2.y.bytes);
          uploadTexture("uTextureCb", formatUpdate, buffer2.u.stride, format.chromaHeight, buffer2.u.bytes);
          uploadTexture("uTextureCr", formatUpdate, buffer2.v.stride, format.chromaHeight, buffer2.v.bytes);
          if (WebGLFrameSink.stripe) {
            unpackTexture("uTextureY", formatUpdate, buffer2.y.stride, format.height);
            unpackTexture("uTextureCb", formatUpdate, buffer2.u.stride, format.chromaHeight);
            unpackTexture("uTextureCr", formatUpdate, buffer2.v.stride, format.chromaHeight);
          }
          gl.useProgram(program);
          gl.viewport(0, 0, canvas.width, canvas.height);
          attachTexture("uTextureY", gl.TEXTURE0, 0);
          attachTexture("uTextureCb", gl.TEXTURE1, 1);
          attachTexture("uTextureCr", gl.TEXTURE2, 2);
          gl.bindBuffer(gl.ARRAY_BUFFER, buf);
          gl.enableVertexAttribArray(positionLocation);
          gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ARRAY_BUFFER, lumaPositionBuffer);
          gl.enableVertexAttribArray(lumaPositionLocation);
          gl.vertexAttribPointer(lumaPositionLocation, 2, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ARRAY_BUFFER, chromaPositionBuffer);
          gl.enableVertexAttribArray(chromaPositionLocation);
          gl.vertexAttribPointer(chromaPositionLocation, 2, gl.FLOAT, false, 0, 0);
          gl.drawArrays(gl.TRIANGLES, 0, rectangle.length / 2);
        };
        self.clear = function() {
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        };
        self.clear();
        return self;
      }
      WebGLFrameSink.stripe = false;
      WebGLFrameSink.contextForCanvas = function(canvas) {
        var options = {
          // Don't trigger discrete GPU in multi-GPU systems
          preferLowPowerToHighPerformance: true,
          powerPreference: "low-power",
          // Don't try to use software GL rendering!
          failIfMajorPerformanceCaveat: true,
          // In case we need to capture the resulting output.
          preserveDrawingBuffer: true
        };
        return canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options);
      };
      WebGLFrameSink.isAvailable = function() {
        var canvas = document.createElement("canvas"), gl;
        canvas.width = 1;
        canvas.height = 1;
        try {
          gl = WebGLFrameSink.contextForCanvas(canvas);
        } catch (e) {
          return false;
        }
        if (gl) {
          var register = gl.TEXTURE0, width = 4, height = 4, texture = gl.createTexture(), data = new Uint8Array(width * height), texWidth = WebGLFrameSink.stripe ? width / 4 : width, format = WebGLFrameSink.stripe ? gl.RGBA : gl.ALPHA, filter = WebGLFrameSink.stripe ? gl.NEAREST : gl.LINEAR;
          gl.activeTexture(register);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            // mip level
            format,
            // internal format
            texWidth,
            height,
            0,
            // border
            format,
            // format
            gl.UNSIGNED_BYTE,
            //type
            data
            // data!
          );
          var err = gl.getError();
          if (err) {
            return false;
          } else {
            return true;
          }
        } else {
          return false;
        }
      };
      WebGLFrameSink.prototype = Object.create(FrameSink.prototype);
      module.exports = WebGLFrameSink;
    })();
  }
});

// node_modules/yuv-canvas/src/yuv-canvas.js
var require_yuv_canvas = __commonJS({
  "node_modules/yuv-canvas/src/yuv-canvas.js"(exports, module) {
    (function() {
      "use strict";
      var FrameSink = require_FrameSink(), SoftwareFrameSink = require_SoftwareFrameSink(), WebGLFrameSink = require_WebGLFrameSink();
      var YUVCanvas = {
        FrameSink,
        SoftwareFrameSink,
        WebGLFrameSink,
        /**
         * Attach a suitable FrameSink instance to an HTML5 canvas element.
         *
         * This will take over the drawing context of the canvas and may turn
         * it into a WebGL 3d canvas if possible. Do not attempt to use the
         * drawing context directly after this.
         *
         * @param {HTMLCanvasElement} canvas - HTML canvas element to attach to
         * @param {YUVCanvasOptions} options - map of options
         * @returns {FrameSink} - instance of suitable subclass.
         */
        attach: function(canvas, options) {
          options = options || {};
          var webGL = "webGL" in options ? options.webGL : WebGLFrameSink.isAvailable();
          if (webGL) {
            return new WebGLFrameSink(canvas, options);
          } else {
            return new SoftwareFrameSink(canvas, options);
          }
        }
      };
      module.exports = YUVCanvas;
    })();
  }
});

// node_modules/@yume-chan/async/esm/promise-resolver.js
var PromiseResolver = class {
  #promise;
  get promise() {
    return this.#promise;
  }
  #resolve;
  #reject;
  #state = "running";
  get state() {
    return this.#state;
  }
  constructor() {
    this.#promise = new Promise((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    });
  }
  resolve = (value) => {
    this.#resolve(value);
    this.#state = "resolved";
  };
  reject = (reason) => {
    this.#reject(reason);
    this.#state = "rejected";
  };
};

// node_modules/@yume-chan/async/esm/async-operation-manager.js
var AsyncOperationManager = class {
  nextId;
  pendingResolvers = /* @__PURE__ */ new Map();
  constructor(startId = 0) {
    this.nextId = startId;
  }
  add() {
    const id = this.nextId++;
    const resolver = new PromiseResolver();
    this.pendingResolvers.set(id, resolver);
    return [id, resolver.promise];
  }
  getResolver(id) {
    if (!this.pendingResolvers.has(id)) {
      return null;
    }
    const resolver = this.pendingResolvers.get(id);
    this.pendingResolvers.delete(id);
    return resolver;
  }
  resolve(id, result) {
    const resolver = this.getResolver(id);
    if (resolver !== null) {
      resolver.resolve(result);
      return true;
    }
    return false;
  }
  reject(id, reason) {
    const resolver = this.getResolver(id);
    if (resolver !== null) {
      resolver.reject(reason);
      return true;
    }
    return false;
  }
};

// node_modules/@yume-chan/async/esm/delay.js
function delay(time) {
  return new Promise((resolve) => {
    globalThis.setTimeout(() => resolve(), time);
  });
}

// node_modules/@yume-chan/async/esm/maybe-promise.js
function isPromiseLike(value) {
  return typeof value === "object" && value !== null && "then" in value;
}

// node_modules/@yume-chan/struct/esm/bipedal.js
function advance(iterator, next) {
  while (true) {
    const { done, value } = iterator.next(next);
    if (done) {
      return value;
    }
    if (isPromiseLike(value)) {
      return value.then((value2) => advance(iterator, { resolved: value2 }), (error) => advance(iterator, { error }));
    }
    next = value;
  }
}
// @__NO_SIDE_EFFECTS__
function bipedal(fn, bindThis) {
  function result(...args) {
    const iterator = fn.call(this, function* (value) {
      if (isPromiseLike(value)) {
        const result2 = yield value;
        if ("resolved" in result2) {
          return result2.resolved;
        } else {
          throw result2.error;
        }
      }
      return value;
    }, ...args);
    return advance(iterator, void 0);
  }
  if (bindThis) {
    return result.bind(bindThis);
  } else {
    return result;
  }
}

// node_modules/@yume-chan/struct/esm/field/serialize.js
function defaultFieldSerializer(serializer) {
  return (source, context) => {
    if ("buffer" in context) {
      const buffer2 = serializer(source, context);
      context.buffer.set(buffer2, context.index);
      return buffer2.length;
    } else {
      return serializer(source, context);
    }
  };
}
function byobFieldSerializer(size, serializer) {
  return (source, context) => {
    if ("buffer" in context) {
      context.index ??= 0;
      serializer(source, context);
      return size;
    } else {
      const buffer2 = new Uint8Array(size);
      serializer(source, {
        buffer: buffer2,
        index: 0,
        littleEndian: context.littleEndian
      });
      return buffer2;
    }
  };
}

// node_modules/@yume-chan/struct/esm/field/factory.js
// @__NO_SIDE_EFFECTS__
function _field(size, type, serialize3, deserialize, options) {
  const field2 = {
    size,
    type,
    serialize: type === "default" ? defaultFieldSerializer(serialize3) : byobFieldSerializer(size, serialize3),
    deserialize: bipedal(deserialize),
    omitInit: options?.omitInit
  };
  if (options?.init) {
    field2.init = options.init;
  }
  return field2;
}
var field = _field;

// node_modules/@yume-chan/struct/esm/buffer.js
var EmptyUint8Array = new Uint8Array(0);
function copyMaybeDifferentLength(dest, source, index, length) {
  if (source.length < length) {
    dest.set(source, index);
    dest.fill(0, index + source.length, index + length);
  } else if (source.length === length) {
    dest.set(source, index);
  } else {
    dest.set(source.subarray(0, length), index);
  }
}
// @__NO_SIDE_EFFECTS__
function buffer(lengthOrField, converter) {
  if (typeof lengthOrField === "number") {
    let serialize3;
    let deserialize2;
    let init2;
    if (lengthOrField === 0) {
      serialize3 = () => {
      };
      if (converter) {
        deserialize2 = function* () {
          return converter.convert(EmptyUint8Array);
        };
      } else {
        deserialize2 = function* () {
          return EmptyUint8Array;
        };
      }
    } else {
      serialize3 = (value, { buffer: buffer2, index }) => copyMaybeDifferentLength(buffer2, value, index, lengthOrField);
      if (converter) {
        deserialize2 = function* (then, reader) {
          const array = reader.readExactly(lengthOrField);
          return converter.convert(yield* then(array));
        };
        init2 = (value) => converter.back(value);
      } else {
        deserialize2 = function* (_then, reader) {
          const array = reader.readExactly(lengthOrField);
          return array;
        };
      }
    }
    return field(lengthOrField, "byob", serialize3, deserialize2, { init: init2 });
  }
  if ((typeof lengthOrField === "object" || typeof lengthOrField === "function") && "serialize" in lengthOrField) {
    let deserialize2;
    let init2;
    if (converter) {
      deserialize2 = function* (then, reader, context) {
        const length = yield* then(lengthOrField.deserialize(reader, context));
        const array = length !== 0 ? reader.readExactly(length) : EmptyUint8Array;
        return converter.convert(yield* then(array));
      };
      init2 = (value) => converter.back(value);
    } else {
      deserialize2 = function* (then, reader, context) {
        const length = yield* then(lengthOrField.deserialize(reader, context));
        const array = length !== 0 ? reader.readExactly(length) : EmptyUint8Array;
        return array;
      };
    }
    return field(lengthOrField.size, "default", (value, { littleEndian }) => {
      if (lengthOrField.type === "default") {
        const lengthBuffer = lengthOrField.serialize(value.length, {
          littleEndian
        });
        if (value.length === 0) {
          return lengthBuffer;
        }
        const result = new Uint8Array(lengthBuffer.length + value.length);
        result.set(lengthBuffer, 0);
        result.set(value, lengthBuffer.length);
        return result;
      } else {
        const result = new Uint8Array(lengthOrField.size + value.length);
        lengthOrField.serialize(value.length, {
          buffer: result,
          index: 0,
          littleEndian
        });
        result.set(value, lengthOrField.size);
        return result;
      }
    }, deserialize2, { init: init2 });
  }
  if (typeof lengthOrField === "string") {
    let deserialize2;
    let init2;
    if (converter) {
      deserialize2 = function* (then, reader, { dependencies }) {
        const length = dependencies[lengthOrField];
        const array = length !== 0 ? reader.readExactly(length) : EmptyUint8Array;
        return converter.convert(yield* then(array));
      };
      init2 = (value, dependencies) => {
        const array = converter.back(value);
        dependencies[lengthOrField] = array.length;
        return array;
      };
    } else {
      deserialize2 = function* (_then, reader, { dependencies }) {
        const length = dependencies[lengthOrField];
        const array = length !== 0 ? reader.readExactly(length) : EmptyUint8Array;
        return array;
      };
      init2 = (value, dependencies) => {
        const array = value;
        dependencies[lengthOrField] = array.length;
        return array;
      };
    }
    return field(0, "default", (source) => source, deserialize2, { init: init2 });
  }
  let deserialize;
  let init;
  if (converter) {
    deserialize = function* (then, reader, { dependencies }) {
      const rawLength = dependencies[lengthOrField.field];
      const length = lengthOrField.convert(rawLength);
      const array = length !== 0 ? reader.readExactly(length) : EmptyUint8Array;
      return converter.convert(yield* then(array));
    };
    init = (value, dependencies) => {
      const array = converter.back(value);
      dependencies[lengthOrField.field] = lengthOrField.back(array.length);
      return array;
    };
  } else {
    deserialize = function* (_then, reader, { dependencies }) {
      const rawLength = dependencies[lengthOrField.field];
      const length = lengthOrField.convert(rawLength);
      const array = length !== 0 ? reader.readExactly(length) : EmptyUint8Array;
      return array;
    };
    init = (value, dependencies) => {
      const array = value;
      dependencies[lengthOrField.field] = lengthOrField.back(array.length);
      return array;
    };
  }
  return field(0, "default", (source) => source, deserialize, { init });
}

// node_modules/@yume-chan/struct/esm/readable.js
var ExactReadableEndedError = class extends Error {
  constructor() {
    super("ExactReadable ended");
  }
};
var Uint8ArrayExactReadable = class {
  #data;
  #position;
  get position() {
    return this.#position;
  }
  constructor(data) {
    this.#data = data;
    this.#position = 0;
  }
  readExactly(length) {
    if (this.#position + length > this.#data.length) {
      throw new ExactReadableEndedError();
    }
    const result = this.#data.subarray(this.#position, this.#position + length);
    this.#position += length;
    return result;
  }
};

// node_modules/@yume-chan/struct/esm/struct.js
var StructDeserializeError = class extends Error {
  constructor(message) {
    super(message);
  }
};
var StructNotEnoughDataError = class extends StructDeserializeError {
  constructor() {
    super("The underlying readable was ended before the struct was fully deserialized");
  }
};
var StructEmptyError = class extends StructDeserializeError {
  constructor() {
    super("The underlying readable doesn't contain any more struct");
  }
};
// @__NO_SIDE_EFFECTS__
function struct(fields, options) {
  const fieldList = Object.entries(fields);
  let size = 0;
  let byob = true;
  for (const [, field2] of fieldList) {
    size += field2.size;
    if (byob && field2.type !== "byob") {
      byob = false;
    }
  }
  const littleEndian = options.littleEndian;
  const extra = options.extra ? Object.getOwnPropertyDescriptors(options.extra) : void 0;
  return {
    littleEndian,
    fields,
    extra: options.extra,
    type: byob ? "byob" : "default",
    size,
    serialize(source, bufferOrContext) {
      const temp = { ...source };
      for (const [key, field2] of fieldList) {
        if (key in temp && "init" in field2) {
          const result = field2.init?.(temp[key], temp);
          temp[key] = result;
        }
      }
      const sizes = new Array(fieldList.length);
      const buffers = new Array(fieldList.length);
      {
        const context2 = { littleEndian };
        for (const [index2, [key, field2]] of fieldList.entries()) {
          if (field2.type === "byob") {
            sizes[index2] = field2.size;
          } else {
            buffers[index2] = field2.serialize(temp[key], context2);
            sizes[index2] = buffers[index2].length;
          }
        }
      }
      const size2 = sizes.reduce((sum, size3) => sum + size3, 0);
      let externalBuffer;
      let buffer2;
      let index;
      if (bufferOrContext instanceof Uint8Array) {
        if (bufferOrContext.length < size2) {
          throw new Error("Buffer too small");
        }
        externalBuffer = true;
        buffer2 = bufferOrContext;
        index = 0;
      } else if (typeof bufferOrContext === "object" && "buffer" in bufferOrContext) {
        externalBuffer = true;
        buffer2 = bufferOrContext.buffer;
        index = bufferOrContext.index ?? 0;
        if (buffer2.length - index < size2) {
          throw new Error("Buffer too small");
        }
      } else {
        externalBuffer = false;
        buffer2 = new Uint8Array(size2);
        index = 0;
      }
      const context = {
        buffer: buffer2,
        index,
        littleEndian
      };
      for (const [index2, [key, field2]] of fieldList.entries()) {
        if (buffers[index2]) {
          buffer2.set(buffers[index2], context.index);
        } else {
          field2.serialize(temp[key], context);
        }
        context.index += sizes[index2];
      }
      if (externalBuffer) {
        return size2;
      } else {
        return buffer2;
      }
    },
    deserialize: bipedal(function* (then, reader) {
      const startPosition = reader.position;
      const result = {};
      const context = {
        dependencies: result,
        littleEndian
      };
      try {
        for (const [key, field2] of fieldList) {
          result[key] = yield* then(field2.deserialize(reader, context));
        }
      } catch (e) {
        if (!(e instanceof ExactReadableEndedError)) {
          throw e;
        }
        if (reader.position === startPosition) {
          throw new StructEmptyError();
        } else {
          throw new StructNotEnoughDataError();
        }
      }
      if (extra) {
        Object.defineProperties(result, extra);
      }
      if (options.postDeserialize) {
        return options.postDeserialize.call(result, result);
      } else {
        return result;
      }
    })
  };
}

// node_modules/@yume-chan/struct/esm/extend.js
// @__NO_SIDE_EFFECTS__
function extend(base, fields, options) {
  return struct(Object.assign({}, base.fields, fields), {
    littleEndian: options?.littleEndian ?? base.littleEndian,
    extra: base.extra,
    postDeserialize: options?.postDeserialize
  });
}

// node_modules/@yume-chan/no-data-view/esm/int16.js
// @__NO_SIDE_EFFECTS__
function getInt16(buffer2, offset, littleEndian) {
  return littleEndian ? (buffer2[offset] | buffer2[offset + 1] << 8) << 16 >> 16 : (buffer2[offset] << 8 | buffer2[offset + 1]) << 16 >> 16;
}
function setInt16(buffer2, offset, value, littleEndian) {
  if (littleEndian) {
    buffer2[offset] = value;
    buffer2[offset + 1] = value >> 8;
  } else {
    buffer2[offset] = value >> 8;
    buffer2[offset + 1] = value;
  }
}

// node_modules/@yume-chan/no-data-view/esm/int32.js
// @__NO_SIDE_EFFECTS__
function getInt32(buffer2, offset, littleEndian) {
  return littleEndian ? buffer2[offset] | buffer2[offset + 1] << 8 | buffer2[offset + 2] << 16 | buffer2[offset + 3] << 24 : buffer2[offset] << 24 | buffer2[offset + 1] << 16 | buffer2[offset + 2] << 8 | buffer2[offset + 3];
}
function setInt32(buffer2, offset, value, littleEndian) {
  if (littleEndian) {
    buffer2[offset] = value;
    buffer2[offset + 1] = value >> 8;
    buffer2[offset + 2] = value >> 16;
    buffer2[offset + 3] = value >> 24;
  } else {
    buffer2[offset] = value >> 24;
    buffer2[offset + 1] = value >> 16;
    buffer2[offset + 2] = value >> 8;
    buffer2[offset + 3] = value;
  }
}

// node_modules/@yume-chan/no-data-view/esm/int64.js
function setInt64LittleEndian(buffer2, offset, value) {
  buffer2[offset] = Number(value & 0xffn);
  buffer2[offset + 1] = Number(value >> 8n & 0xffn);
  buffer2[offset + 2] = Number(value >> 16n & 0xffn);
  buffer2[offset + 3] = Number(value >> 24n & 0xffn);
  buffer2[offset + 4] = Number(value >> 32n & 0xffn);
  buffer2[offset + 5] = Number(value >> 40n & 0xffn);
  buffer2[offset + 6] = Number(value >> 48n & 0xffn);
  buffer2[offset + 7] = Number(value >> 56n & 0xffn);
}
function setInt64BigEndian(buffer2, offset, value) {
  buffer2[offset] = Number(value >> 56n & 0xffn);
  buffer2[offset + 1] = Number(value >> 48n & 0xffn);
  buffer2[offset + 2] = Number(value >> 40n & 0xffn);
  buffer2[offset + 3] = Number(value >> 32n & 0xffn);
  buffer2[offset + 4] = Number(value >> 24n & 0xffn);
  buffer2[offset + 5] = Number(value >> 16n & 0xffn);
  buffer2[offset + 6] = Number(value >> 8n & 0xffn);
  buffer2[offset + 7] = Number(value & 0xffn);
}

// node_modules/@yume-chan/no-data-view/esm/uint16.js
// @__NO_SIDE_EFFECTS__
function getUint16BigEndian(buffer2, offset) {
  return buffer2[offset] << 8 | buffer2[offset + 1];
}
// @__NO_SIDE_EFFECTS__
function getUint16(buffer2, offset, littleEndian) {
  return littleEndian ? buffer2[offset] | buffer2[offset + 1] << 8 : buffer2[offset + 1] | buffer2[offset] << 8;
}
function setUint16(buffer2, offset, value, littleEndian) {
  if (littleEndian) {
    buffer2[offset] = value;
    buffer2[offset + 1] = value >> 8;
  } else {
    buffer2[offset] = value >> 8;
    buffer2[offset + 1] = value;
  }
}

// node_modules/@yume-chan/no-data-view/esm/uint32.js
// @__NO_SIDE_EFFECTS__
function getUint32LittleEndian(buffer2, offset) {
  return (buffer2[offset] | buffer2[offset + 1] << 8 | buffer2[offset + 2] << 16 | buffer2[offset + 3] << 24) >>> 0;
}
// @__NO_SIDE_EFFECTS__
function getUint32BigEndian(buffer2, offset) {
  return (buffer2[offset] << 24 | buffer2[offset + 1] << 16 | buffer2[offset + 2] << 8 | buffer2[offset + 3]) >>> 0;
}
// @__NO_SIDE_EFFECTS__
function getUint32(buffer2, offset, littleEndian) {
  return littleEndian ? (buffer2[offset] | buffer2[offset + 1] << 8 | buffer2[offset + 2] << 16 | buffer2[offset + 3] << 24) >>> 0 : (buffer2[offset] << 24 | buffer2[offset + 1] << 16 | buffer2[offset + 2] << 8 | buffer2[offset + 3]) >>> 0;
}
function setUint32LittleEndian(buffer2, offset, value) {
  buffer2[offset] = value;
  buffer2[offset + 1] = value >> 8;
  buffer2[offset + 2] = value >> 16;
  buffer2[offset + 3] = value >> 24;
}
function setUint32(buffer2, offset, value, littleEndian) {
  if (littleEndian) {
    buffer2[offset] = value;
    buffer2[offset + 1] = value >> 8;
    buffer2[offset + 2] = value >> 16;
    buffer2[offset + 3] = value >> 24;
  } else {
    buffer2[offset] = value >> 24;
    buffer2[offset + 1] = value >> 16;
    buffer2[offset + 2] = value >> 8;
    buffer2[offset + 3] = value;
  }
}

// node_modules/@yume-chan/no-data-view/esm/uint64.js
function getUint64BigEndian(buffer2, offset) {
  return BigInt(buffer2[offset]) << 56n | BigInt(buffer2[offset + 1]) << 48n | BigInt(buffer2[offset + 2]) << 40n | BigInt(buffer2[offset + 3]) << 32n | BigInt(buffer2[offset + 4]) << 24n | BigInt(buffer2[offset + 5]) << 16n | BigInt(buffer2[offset + 6]) << 8n | BigInt(buffer2[offset + 7]);
}
function getUint64(buffer2, offset, littleEndian) {
  return littleEndian ? BigInt(buffer2[offset]) | BigInt(buffer2[offset + 1]) << 8n | BigInt(buffer2[offset + 2]) << 16n | BigInt(buffer2[offset + 3]) << 24n | BigInt(buffer2[offset + 4]) << 32n | BigInt(buffer2[offset + 5]) << 40n | BigInt(buffer2[offset + 6]) << 48n | BigInt(buffer2[offset + 7]) << 56n : BigInt(buffer2[offset]) << 56n | BigInt(buffer2[offset + 1]) << 48n | BigInt(buffer2[offset + 2]) << 40n | BigInt(buffer2[offset + 3]) << 32n | BigInt(buffer2[offset + 4]) << 24n | BigInt(buffer2[offset + 5]) << 16n | BigInt(buffer2[offset + 6]) << 8n | BigInt(buffer2[offset + 7]);
}
function setUint64(buffer2, offset, value, littleEndian) {
  if (littleEndian) {
    buffer2[offset] = Number(value & 0xffn);
    buffer2[offset + 1] = Number(value >> 8n & 0xffn);
    buffer2[offset + 2] = Number(value >> 16n & 0xffn);
    buffer2[offset + 3] = Number(value >> 24n & 0xffn);
    buffer2[offset + 4] = Number(value >> 32n & 0xffn);
    buffer2[offset + 5] = Number(value >> 40n & 0xffn);
    buffer2[offset + 6] = Number(value >> 48n & 0xffn);
    buffer2[offset + 7] = Number(value >> 56n & 0xffn);
  } else {
    buffer2[offset] = Number(value >> 56n & 0xffn);
    buffer2[offset + 1] = Number(value >> 48n & 0xffn);
    buffer2[offset + 2] = Number(value >> 40n & 0xffn);
    buffer2[offset + 3] = Number(value >> 32n & 0xffn);
    buffer2[offset + 4] = Number(value >> 24n & 0xffn);
    buffer2[offset + 5] = Number(value >> 16n & 0xffn);
    buffer2[offset + 6] = Number(value >> 8n & 0xffn);
    buffer2[offset + 7] = Number(value & 0xffn);
  }
}

// node_modules/@yume-chan/struct/esm/number.js
// @__NO_SIDE_EFFECTS__
function number(size, serialize3, deserialize) {
  const fn = (() => fn);
  Object.assign(fn, field(size, "byob", serialize3, deserialize));
  return fn;
}
var u8 = /* @__PURE__ */ number(1, (value, { buffer: buffer2, index }) => {
  buffer2[index] = value;
}, function* (then, reader) {
  const data = yield* then(reader.readExactly(1));
  return data[0];
});
var u16 = /* @__PURE__ */ number(2, (value, { buffer: buffer2, index, littleEndian }) => {
  setUint16(buffer2, index, value, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(2));
  return getUint16(data, 0, littleEndian);
});
var u32 = /* @__PURE__ */ number(4, (value, { buffer: buffer2, index, littleEndian }) => {
  setUint32(buffer2, index, value, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(4));
  return getUint32(data, 0, littleEndian);
});
var s32 = /* @__PURE__ */ number(4, (value, { buffer: buffer2, index, littleEndian }) => {
  setInt32(buffer2, index, value, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(4));
  return getInt32(data, 0, littleEndian);
});
var u64 = /* @__PURE__ */ number(8, (value, { buffer: buffer2, index, littleEndian }) => {
  setUint64(buffer2, index, value, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(8));
  return getUint64(data, 0, littleEndian);
});

// node_modules/@yume-chan/struct/esm/utils.js
var { TextEncoder, TextDecoder } = globalThis;
var SharedEncoder = /* @__PURE__ */ new TextEncoder();
var SharedDecoder = /* @__PURE__ */ new TextDecoder();
// @__NO_SIDE_EFFECTS__
function encodeUtf8(input) {
  return SharedEncoder.encode(input);
}
// @__NO_SIDE_EFFECTS__
function decodeUtf8(buffer2) {
  return SharedDecoder.decode(buffer2);
}

// node_modules/@yume-chan/struct/esm/string.js
var string = (/* @__NO_SIDE_EFFECTS__ */ (lengthOrField) => {
  const field2 = buffer(lengthOrField, {
    convert: decodeUtf8,
    back: encodeUtf8
  });
  field2.as = () => field2;
  return field2;
});

// node_modules/@yume-chan/stream-extra/esm/stream.js
var { AbortController } = globalThis;
var ReadableStream2 = /* @__PURE__ */ (() => {
  const { ReadableStream: ReadableStream3 } = globalThis;
  if (!ReadableStream3.from) {
    ReadableStream3.from = function(iterable) {
      const iterator = Symbol.asyncIterator in iterable ? iterable[Symbol.asyncIterator]() : iterable[Symbol.iterator]();
      return new ReadableStream3({
        async pull(controller) {
          const result = await iterator.next();
          if (result.done) {
            controller.close();
            return;
          }
          controller.enqueue(result.value);
        },
        async cancel(reason) {
          await iterator.return?.(reason);
        }
      });
    };
  }
  if (!ReadableStream3.prototype[Symbol.asyncIterator] || !ReadableStream3.prototype.values) {
    ReadableStream3.prototype.values = async function* (options) {
      const reader = this.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            return;
          }
          yield value;
        }
      } finally {
        if (!options?.preventCancel) {
          await reader.cancel();
        }
        reader.releaseLock();
      }
    };
    ReadableStream3.prototype[Symbol.asyncIterator] = // eslint-disable-next-line @typescript-eslint/unbound-method
    ReadableStream3.prototype.values;
  }
  return ReadableStream3;
})();
var { WritableStream, TransformStream } = globalThis;

// node_modules/@yume-chan/stream-extra/esm/task-queue.js
var TaskQueue = class {
  #ready;
  #disposed = false;
  enqueue(task, bail = false) {
    if (this.#disposed) {
      throw new Error("TaskQueue is disposed");
    }
    if (!this.#ready) {
      try {
        const result2 = task();
        if (isPromiseLike(result2)) {
          this.#ready = result2.then(() => {
          }, (e) => {
            if (bail) {
              throw e;
            }
          });
        }
        return result2;
      } catch (e) {
        if (bail) {
          const promise = Promise.reject(e);
          void promise.catch(() => {
          });
          this.#ready = promise;
        }
        throw e;
      }
    }
    const result = this.#ready.then(() => {
      if (this.#disposed) {
        throw new Error("TaskQueue is disposed");
      }
      return task();
    });
    this.#ready = result.then(() => {
    }, (e) => {
      if (bail || this.#disposed) {
        throw e;
      }
    });
    return result;
  }
  dispose() {
    this.#disposed = true;
  }
};

// node_modules/@yume-chan/stream-extra/esm/push-readable.js
var PushReadableStream = class extends ReadableStream2 {
  /**
   * Create a new `PushReadableStream` from a source.
   *
   * @param source If `source` returns a `Promise`, the stream will be closed
   * when the `Promise` is resolved, and be errored when the `Promise` is rejected.
   * @param strategy
   */
  constructor(source, strategy, logger) {
    let controller;
    const tasks = new TaskQueue();
    let zeroHighWaterMarkAllowEnqueue = false;
    let waterMarkLow;
    const abortController = new AbortController();
    let stopped = false;
    const enqueue = (chunk) => {
      logger?.({
        source: "producer",
        operation: "enqueue",
        value: chunk,
        phase: "start"
      });
      if (abortController.signal.aborted) {
        logger?.({
          source: "producer",
          operation: "enqueue",
          value: chunk,
          phase: "ignored"
        });
        return false;
      }
      if (controller.desiredSize === null) {
        controller.enqueue(chunk);
        throw new Error("unreachable");
      }
      if (zeroHighWaterMarkAllowEnqueue) {
        zeroHighWaterMarkAllowEnqueue = false;
        controller.enqueue(chunk);
        logger?.({
          source: "producer",
          operation: "enqueue",
          value: chunk,
          phase: "complete"
        });
        return true;
      }
      if (controller.desiredSize <= 0) {
        logger?.({
          source: "producer",
          operation: "enqueue",
          value: chunk,
          phase: "waiting"
        });
        waterMarkLow = new PromiseResolver();
        return waterMarkLow.promise.then(() => {
          controller.enqueue(chunk);
          logger?.({
            source: "producer",
            operation: "enqueue",
            value: chunk,
            phase: "complete"
          });
          return true;
        }, () => {
          logger?.({
            source: "producer",
            operation: "enqueue",
            value: chunk,
            phase: "ignored"
          });
          return false;
        });
      }
      controller.enqueue(chunk);
      logger?.({
        source: "producer",
        operation: "enqueue",
        value: chunk,
        phase: "complete"
      });
      return true;
    };
    const close = (explicit) => {
      logger?.({
        source: "producer",
        operation: "close",
        explicit,
        phase: "start"
      });
      if (abortController.signal.aborted || stopped && !explicit) {
        logger?.({
          source: "producer",
          operation: "close",
          explicit,
          phase: "ignored"
        });
        return;
      }
      controller.close();
      stopped = true;
      waterMarkLow?.reject();
      logger?.({
        source: "producer",
        operation: "close",
        explicit,
        phase: "complete"
      });
    };
    const error = (error2, explicit) => {
      logger?.({
        source: "producer",
        operation: "error",
        explicit,
        phase: "start"
      });
      stopped = true;
      controller.error(error2);
      waterMarkLow?.reject();
      logger?.({
        source: "producer",
        operation: "error",
        explicit,
        phase: "complete"
      });
    };
    super({
      start: (controller_) => {
        controller = controller_;
        const result = source({
          abortSignal: abortController.signal,
          enqueue: async (chunk) => (
            // Run `enqueue`s in serial
            // Use `async/await` to always return a `Promise`
            await tasks.enqueue(() => enqueue(chunk))
          ),
          close() {
            close(true);
          },
          error(e) {
            error(e, true);
          }
        });
        if (!stopped && isPromiseLike(result)) {
          result.then(() => close(false), (e) => error(e, false));
        }
      },
      pull: () => {
        logger?.({
          source: "consumer",
          operation: "pull",
          phase: "start"
        });
        if (waterMarkLow) {
          waterMarkLow.resolve(void 0);
          waterMarkLow = void 0;
        } else if (strategy?.highWaterMark === 0) {
          zeroHighWaterMarkAllowEnqueue = true;
        }
        logger?.({
          source: "consumer",
          operation: "pull",
          phase: "complete"
        });
      },
      cancel: (reason) => {
        logger?.({
          source: "consumer",
          operation: "cancel",
          phase: "start"
        });
        stopped = true;
        abortController.abort(reason);
        waterMarkLow?.reject();
        logger?.({
          source: "consumer",
          operation: "cancel",
          phase: "complete"
        });
      }
    }, strategy);
  }
};

// node_modules/@yume-chan/stream-extra/esm/try-close.js
function tryClose(value) {
  try {
    const result = value.close();
    if (isPromiseLike(result)) {
      return result.then(() => true, () => false);
    }
    return true;
  } catch {
    return false;
  }
}
async function tryCancel(stream) {
  try {
    await stream.cancel();
    return true;
  } catch {
    return false;
  }
}

// node_modules/@yume-chan/stream-extra/esm/buffered.js
var BufferedReadableStream = class {
  #buffered;
  // PERF: `subarray` is slow
  // don't use it until absolutely necessary
  #bufferedOffset = 0;
  #bufferedLength = 0;
  #position = 0;
  get position() {
    return this.#position;
  }
  stream;
  reader;
  constructor(stream) {
    this.stream = stream;
    this.reader = stream.getReader();
  }
  #readBuffered(length) {
    if (!this.#buffered) {
      return void 0;
    }
    const value = this.#buffered.subarray(this.#bufferedOffset, this.#bufferedOffset + length);
    if (this.#bufferedLength > length) {
      this.#position += length;
      this.#bufferedOffset += length;
      this.#bufferedLength -= length;
      return value;
    }
    this.#position += this.#bufferedLength;
    this.#buffered = void 0;
    this.#bufferedOffset = 0;
    this.#bufferedLength = 0;
    return value;
  }
  async #readSource(length) {
    const { done, value } = await this.reader.read();
    if (done) {
      throw new ExactReadableEndedError();
    }
    if (value.length > length) {
      this.#buffered = value;
      this.#bufferedOffset = length;
      this.#bufferedLength = value.length - length;
      this.#position += length;
      return value.subarray(0, length);
    }
    this.#position += value.length;
    return value;
  }
  iterateExactly(length) {
    let state = this.#buffered ? 0 : 1;
    return {
      next: () => {
        switch (state) {
          case 0: {
            const value = this.#readBuffered(length);
            if (value.length === length) {
              state = 2;
            } else {
              length -= value.length;
              state = 1;
            }
            return { done: false, value };
          }
          case 1:
            state = 3;
            return {
              done: false,
              value: this.#readSource(length).then((value) => {
                if (value.length === length) {
                  state = 2;
                } else {
                  length -= value.length;
                  state = 1;
                }
                return value;
              })
            };
          case 2:
            return { done: true, value: void 0 };
          case 3:
            throw new Error("Can't call `next` before previous Promise resolves");
          default:
            throw new Error("unreachable");
        }
      }
    };
  }
  readExactly = bipedal(function* (then, length) {
    let result;
    let index = 0;
    const initial = this.#readBuffered(length);
    if (initial) {
      if (initial.length === length) {
        return initial;
      }
      result = new Uint8Array(length);
      result.set(initial, index);
      index += initial.length;
      length -= initial.length;
    } else {
      result = new Uint8Array(length);
    }
    while (length > 0) {
      const value = yield* then(this.#readSource(length));
      result.set(value, index);
      index += value.length;
      length -= value.length;
    }
    return result;
  });
  /**
   * Return a readable stream with unconsumed data (if any) and
   * all data from the wrapped stream.
   * @returns A `ReadableStream`
   */
  release() {
    if (this.#bufferedLength > 0) {
      return new PushReadableStream(async (controller) => {
        const buffered = this.#buffered.subarray(this.#bufferedOffset);
        await controller.enqueue(buffered);
        controller.abortSignal.addEventListener("abort", () => {
          void tryCancel(this.reader);
        });
        while (true) {
          const { done, value } = await this.reader.read();
          if (done) {
            return;
          }
          await controller.enqueue(value);
        }
      });
    } else {
      this.reader.releaseLock();
      return this.stream;
    }
  }
  async cancel(reason) {
    await this.reader.cancel(reason);
  }
};

// node_modules/@yume-chan/stream-extra/esm/buffered-transform.js
var BufferedTransformStream = class {
  #readable;
  get readable() {
    return this.#readable;
  }
  #writable;
  get writable() {
    return this.#writable;
  }
  constructor(transform) {
    let bufferedStreamController;
    let writableStreamController;
    const buffered = new BufferedReadableStream(new PushReadableStream((controller) => {
      bufferedStreamController = controller;
    }));
    this.#readable = new ReadableStream2({
      async pull(controller) {
        try {
          const value = await transform(buffered);
          controller.enqueue(value);
        } catch (e) {
          if (e instanceof StructEmptyError) {
            controller.close();
            return;
          }
          throw e;
        }
      },
      cancel: (reason) => {
        return writableStreamController.error(reason);
      }
    });
    this.#writable = new WritableStream({
      start(controller) {
        writableStreamController = controller;
      },
      async write(chunk) {
        await bufferedStreamController.enqueue(chunk);
      },
      abort() {
        bufferedStreamController.close();
      },
      close() {
        bufferedStreamController.close();
      }
    });
  }
};

// node_modules/@yume-chan/stream-extra/esm/concat.js
var ConcatStringStream = class {
  // PERF: rope (concat strings) is faster than `[].join('')`
  #result = "";
  #resolver = new PromiseResolver();
  #writable = new WritableStream({
    write: (chunk) => {
      this.#result += chunk;
    },
    close: () => {
      this.#resolver.resolve(this.#result);
      this.#readableController.enqueue(this.#result);
      this.#readableController.close();
    },
    abort: (reason) => {
      this.#resolver.reject(reason);
      this.#readableController.error(reason);
    }
  });
  get writable() {
    return this.#writable;
  }
  #readableController;
  #readable = new ReadableStream2({
    start: (controller) => {
      this.#readableController = controller;
    }
  });
  get readable() {
    return this.#readable;
  }
  constructor() {
    void Object.defineProperties(this.#readable, {
      then: {
        get: () => this.#resolver.promise.then.bind(this.#resolver.promise)
      },
      catch: {
        get: () => this.#resolver.promise.catch.bind(this.#resolver.promise)
      },
      finally: {
        get: () => this.#resolver.promise.finally.bind(this.#resolver.promise)
      }
    });
  }
};
var ConcatBufferStream = class {
  #segments = [];
  #resolver = new PromiseResolver();
  #writable = new WritableStream({
    write: (chunk) => {
      this.#segments.push(chunk);
    },
    close: () => {
      let result;
      let offset = 0;
      switch (this.#segments.length) {
        case 0:
          result = EmptyUint8Array;
          break;
        case 1:
          result = this.#segments[0];
          break;
        default:
          result = new Uint8Array(this.#segments.reduce((prev, item) => prev + item.length, 0));
          for (const segment of this.#segments) {
            result.set(segment, offset);
            offset += segment.length;
          }
          break;
      }
      this.#resolver.resolve(result);
      this.#readableController.enqueue(result);
      this.#readableController.close();
    },
    abort: (reason) => {
      this.#resolver.reject(reason);
      this.#readableController.error(reason);
    }
  });
  get writable() {
    return this.#writable;
  }
  #readableController;
  #readable = new ReadableStream2({
    start: (controller) => {
      this.#readableController = controller;
    }
  });
  get readable() {
    return this.#readable;
  }
  constructor() {
    void Object.defineProperties(this.#readable, {
      then: {
        get: () => this.#resolver.promise.then.bind(this.#resolver.promise)
      },
      catch: {
        get: () => this.#resolver.promise.catch.bind(this.#resolver.promise)
      },
      finally: {
        get: () => this.#resolver.promise.finally.bind(this.#resolver.promise)
      }
    });
  }
};

// node_modules/@yume-chan/stream-extra/esm/consumable/readable.js
var ConsumableReadableStream = class _ConsumableReadableStream extends ReadableStream2 {
  static async enqueue(controller, chunk) {
    const output = new Consumable(chunk);
    controller.enqueue(output);
    await output.consumed;
  }
  constructor(source, strategy) {
    let wrappedController;
    let wrappedStrategy;
    if (strategy) {
      wrappedStrategy = {};
      if ("highWaterMark" in strategy) {
        wrappedStrategy.highWaterMark = strategy.highWaterMark;
      }
      if ("size" in strategy) {
        wrappedStrategy.size = (chunk) => {
          return strategy.size(chunk.value);
        };
      }
    }
    super({
      start(controller) {
        wrappedController = {
          enqueue(chunk) {
            return _ConsumableReadableStream.enqueue(controller, chunk);
          },
          close() {
            controller.close();
          },
          error(reason) {
            controller.error(reason);
          }
        };
        return source.start?.(wrappedController);
      },
      pull() {
        return source.pull?.(wrappedController);
      },
      cancel(reason) {
        return source.cancel?.(reason);
      }
    }, wrappedStrategy);
  }
};

// node_modules/@yume-chan/stream-extra/esm/consumable/wrap-byte-readable.js
var ConsumableWrapByteReadableStream = class extends ReadableStream2 {
  constructor(stream, chunkSize, min) {
    const reader = stream.getReader({ mode: "byob" });
    let array = new Uint8Array(chunkSize);
    super({
      async pull(controller) {
        const { done, value } = await reader.read(array, { min });
        if (done) {
          controller.close();
          return;
        }
        await ConsumableReadableStream.enqueue(controller, value);
        array = new Uint8Array(value.buffer);
      },
      cancel(reason) {
        return reader.cancel(reason);
      }
    });
  }
};

// node_modules/@yume-chan/stream-extra/esm/consumable/wrap-writable.js
var ConsumableWrapWritableStream = class extends WritableStream {
  constructor(stream) {
    const writer = stream.getWriter();
    super({
      write(chunk) {
        return chunk.tryConsume((chunk2) => writer.write(chunk2));
      },
      abort(reason) {
        return writer.abort(reason);
      },
      close() {
        return writer.close();
      }
    });
  }
};

// node_modules/@yume-chan/stream-extra/esm/consumable/writable.js
var ConsumableWritableStream = class extends WritableStream {
  static async write(writer, value) {
    const consumable = new Consumable(value);
    await writer.write(consumable);
    await consumable.consumed;
  }
  constructor(sink, strategy) {
    let wrappedStrategy;
    if (strategy) {
      wrappedStrategy = {};
      if ("highWaterMark" in strategy) {
        wrappedStrategy.highWaterMark = strategy.highWaterMark;
      }
      if ("size" in strategy) {
        wrappedStrategy.size = (chunk) => {
          return strategy.size(chunk instanceof Consumable ? chunk.value : chunk);
        };
      }
    }
    super({
      start(controller) {
        return sink.start?.(controller);
      },
      write(chunk, controller) {
        return chunk.tryConsume((chunk2) => sink.write?.(chunk2, controller));
      },
      abort(reason) {
        return sink.abort?.(reason);
      },
      close() {
        return sink.close?.();
      }
    }, wrappedStrategy);
  }
};

// node_modules/@yume-chan/stream-extra/esm/task.js
var { console: console2 } = globalThis;
var createTask = /* @__PURE__ */ (() => console2?.createTask?.bind(console2) ?? (() => ({
  run(callback) {
    return callback();
  }
})))();

// node_modules/@yume-chan/stream-extra/esm/consumable.js
var Consumable = class {
  static WritableStream = ConsumableWritableStream;
  static WrapWritableStream = ConsumableWrapWritableStream;
  static ReadableStream = ConsumableReadableStream;
  static WrapByteReadableStream = ConsumableWrapByteReadableStream;
  #task;
  #resolver;
  value;
  consumed;
  constructor(value) {
    this.#task = createTask("Consumable");
    this.value = value;
    this.#resolver = new PromiseResolver();
    this.consumed = this.#resolver.promise;
  }
  consume() {
    this.#resolver.resolve();
  }
  error(error) {
    this.#resolver.reject(error);
  }
  tryConsume(callback) {
    try {
      let result = this.#task.run(() => callback(this.value));
      if (isPromiseLike(result)) {
        result = result.then((value) => {
          this.#resolver.resolve();
          return value;
        }, (e) => {
          this.#resolver.reject(e);
          throw e;
        });
      } else {
        this.#resolver.resolve();
      }
      return result;
    } catch (e) {
      this.#resolver.reject(e);
      throw e;
    }
  }
};

// node_modules/@yume-chan/stream-extra/esm/maybe-consumable/index.js
var maybe_consumable_exports = {};
__export(maybe_consumable_exports, {
  WrapWritableStream: () => MaybeConsumableWrapWritableStream,
  WritableStream: () => MaybeConsumableWritableStream,
  getValue: () => getValue,
  tryConsume: () => tryConsume
});

// node_modules/@yume-chan/stream-extra/esm/maybe-consumable/utils.js
function getValue(value) {
  return value instanceof Consumable ? value.value : value;
}
function tryConsume(value, callback) {
  if (value instanceof Consumable) {
    return value.tryConsume(callback);
  } else {
    return callback(value);
  }
}

// node_modules/@yume-chan/stream-extra/esm/maybe-consumable/wrap-writable.js
var MaybeConsumableWrapWritableStream = class extends WritableStream {
  constructor(stream) {
    const writer = stream.getWriter();
    super({
      write(chunk) {
        return tryConsume(chunk, (chunk2) => writer.write(chunk2));
      },
      abort(reason) {
        return writer.abort(reason);
      },
      close() {
        return writer.close();
      }
    });
  }
};

// node_modules/@yume-chan/stream-extra/esm/maybe-consumable/writable.js
var MaybeConsumableWritableStream = class extends WritableStream {
  constructor(sink, strategy) {
    let wrappedStrategy;
    if (strategy) {
      wrappedStrategy = {};
      if ("highWaterMark" in strategy) {
        wrappedStrategy.highWaterMark = strategy.highWaterMark;
      }
      if ("size" in strategy) {
        wrappedStrategy.size = (chunk) => {
          return strategy.size(chunk instanceof Consumable ? chunk.value : chunk);
        };
      }
    }
    super({
      start(controller) {
        return sink.start?.(controller);
      },
      write(chunk, controller) {
        return tryConsume(chunk, (chunk2) => sink.write?.(chunk2, controller));
      },
      abort(reason) {
        return sink.abort?.(reason);
      },
      close() {
        return sink.close?.();
      }
    }, wrappedStrategy);
  }
};

// node_modules/@yume-chan/stream-extra/esm/distribution.js
var BufferCombiner = class {
  #capacity;
  #buffer;
  #offset;
  #available;
  constructor(size) {
    this.#capacity = size;
    this.#buffer = new Uint8Array(size);
    this.#offset = 0;
    this.#available = size;
  }
  /**
   * Pushes data to the combiner.
   * @param data The input data to be split or combined.
   * @returns
   * A generator that yields buffers of specified size.
   * It may yield the same buffer multiple times, consume the data before calling `next`.
   */
  *push(data) {
    let offset = 0;
    let available = data.length;
    if (this.#offset !== 0) {
      if (available >= this.#available) {
        this.#buffer.set(data.subarray(0, this.#available), this.#offset);
        offset += this.#available;
        available -= this.#available;
        yield this.#buffer;
        this.#offset = 0;
        this.#available = this.#capacity;
        if (available === 0) {
          return;
        }
      } else {
        this.#buffer.set(data, this.#offset);
        this.#offset += available;
        this.#available -= available;
        return;
      }
    }
    while (available >= this.#capacity) {
      const end = offset + this.#capacity;
      yield data.subarray(offset, end);
      offset = end;
      available -= this.#capacity;
    }
    if (available > 0) {
      this.#buffer.set(data.subarray(offset), this.#offset);
      this.#offset += available;
      this.#available -= available;
    }
  }
  flush() {
    if (this.#offset === 0) {
      return void 0;
    }
    const output = this.#buffer.subarray(0, this.#offset);
    this.#offset = 0;
    this.#available = this.#capacity;
    return output;
  }
};
var DistributionStream = class extends TransformStream {
  constructor(size, combine = false) {
    const combiner = combine ? new BufferCombiner(size) : void 0;
    super({
      async transform(chunk, controller) {
        await maybe_consumable_exports.tryConsume(chunk, async (chunk2) => {
          if (combiner) {
            for (const buffer2 of combiner.push(chunk2)) {
              await Consumable.ReadableStream.enqueue(controller, buffer2);
            }
          } else {
            let offset = 0;
            let available = chunk2.length;
            while (available > 0) {
              const end = offset + size;
              await Consumable.ReadableStream.enqueue(controller, chunk2.subarray(offset, end));
              offset = end;
              available -= size;
            }
          }
        });
      },
      flush(controller) {
        if (combiner) {
          const data = combiner.flush();
          if (data) {
            controller.enqueue(data);
          }
        }
      }
    });
  }
};

// node_modules/@yume-chan/stream-extra/esm/wrap-readable.js
function getWrappedReadableStream(wrapper, controller) {
  if ("start" in wrapper) {
    return wrapper.start(controller);
  } else if (typeof wrapper === "function") {
    return wrapper(controller);
  } else {
    return wrapper;
  }
}
var WrapReadableStream = class extends ReadableStream2 {
  readable;
  #reader;
  constructor(wrapper, strategy) {
    super({
      start: async (controller) => {
        const readable = await getWrappedReadableStream(wrapper, controller);
        this.readable = readable;
        this.#reader = this.readable.getReader();
      },
      pull: async (controller) => {
        const { done, value } = await this.#reader.read().catch((e) => {
          if ("error" in wrapper) {
            wrapper.error(e);
          }
          throw e;
        });
        if (done) {
          controller.close();
          if ("close" in wrapper) {
            await wrapper.close?.();
          }
        } else {
          controller.enqueue(value);
        }
      },
      cancel: async (reason) => {
        await this.#reader.cancel(reason);
        if ("cancel" in wrapper) {
          await wrapper.cancel?.(reason);
        }
      }
    }, strategy);
  }
};

// node_modules/@yume-chan/stream-extra/esm/duplex.js
var NOOP = () => {
};
var DuplexStreamFactory = class {
  #readableControllers = [];
  #writers = [];
  #writableClosed = false;
  get writableClosed() {
    return this.#writableClosed;
  }
  #closed = new PromiseResolver();
  get closed() {
    return this.#closed.promise;
  }
  #options;
  constructor(options) {
    this.#options = options ?? {};
  }
  wrapReadable(readable, strategy) {
    return new WrapReadableStream({
      start: (controller) => {
        this.#readableControllers.push(controller);
        return readable;
      },
      cancel: async () => {
        await this.close();
      },
      close: async () => {
        await this.dispose();
      }
    }, strategy);
  }
  createWritable(stream) {
    const writer = stream.getWriter();
    this.#writers.push(writer);
    return new WritableStream({
      write: async (chunk) => {
        await writer.write(chunk);
      },
      abort: async (reason) => {
        await writer.abort(reason);
        await this.close();
      },
      close: async () => {
        await writer.close().catch(NOOP);
        await this.close();
      }
    });
  }
  async close() {
    if (this.#writableClosed) {
      return;
    }
    this.#writableClosed = true;
    if (await this.#options.close?.() !== false) {
      await this.dispose();
    }
    for (const writer of this.#writers) {
      writer.close().catch(NOOP);
    }
  }
  async dispose() {
    this.#writableClosed = true;
    this.#closed.resolve();
    for (const controller of this.#readableControllers) {
      tryClose(controller);
    }
    await this.#options.dispose?.();
  }
};

// node_modules/@yume-chan/stream-extra/esm/encoding.js
var Global = globalThis;
var TextDecoderStream = Global.TextDecoderStream;
var TextEncoderStream = Global.TextEncoderStream;

// node_modules/@yume-chan/stream-extra/esm/inspect.js
var InspectStream = class extends TransformStream {
  constructor(callback) {
    super({
      transform(chunk, controller) {
        callback(chunk);
        controller.enqueue(chunk);
      }
    });
  }
};

// node_modules/@yume-chan/stream-extra/esm/pipe-from.js
function pipeFrom(writable, pair) {
  const writer = pair.writable.getWriter();
  const pipe = pair.readable.pipeTo(writable);
  return new WritableStream({
    async write(chunk) {
      await writer.write(chunk);
    },
    async close() {
      await writer.close();
      await pipe;
    }
  });
}

// node_modules/@yume-chan/stream-extra/esm/split-string.js
var SplitStringStream = class extends TransformStream {
  constructor(separator) {
    let remaining = void 0;
    super({
      transform(chunk, controller) {
        if (remaining) {
          chunk = remaining + chunk;
          remaining = void 0;
        }
        let start = 0;
        while (start < chunk.length) {
          const index = chunk.indexOf(separator, start);
          if (index === -1) {
            remaining = chunk.substring(start);
            break;
          }
          controller.enqueue(chunk.substring(start, index));
          start = index + 1;
        }
      },
      flush(controller) {
        if (remaining) {
          controller.enqueue(remaining);
        }
      }
    });
  }
};

// node_modules/@yume-chan/stream-extra/esm/struct-deserialize.js
var StructDeserializeStream = class extends BufferedTransformStream {
  constructor(struct2) {
    super((stream) => {
      return struct2.deserialize(stream);
    });
  }
};

// node_modules/@yume-chan/event/esm/disposable.js
var AutoDisposable = class {
  #disposables = [];
  constructor() {
    this.dispose = this.dispose.bind(this);
  }
  addDisposable(disposable) {
    this.#disposables.push(disposable);
    return disposable;
  }
  dispose() {
    for (const disposable of this.#disposables) {
      disposable.dispose();
    }
    this.#disposables = [];
  }
};

// node_modules/@yume-chan/event/esm/event-emitter.js
var EventEmitter = class {
  listeners = [];
  constructor() {
    this.event = this.event.bind(this);
  }
  addEventListener(info) {
    this.listeners.push(info);
    const remove = () => {
      const index = this.listeners.indexOf(info);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
    remove.dispose = remove;
    return remove;
  }
  event = (listener, thisArg, ...args) => {
    const info = {
      listener,
      thisArg,
      args
    };
    return this.addEventListener(info);
  };
  fire(e) {
    for (const info of this.listeners.slice()) {
      info.listener.call(info.thisArg, e, ...info.args);
    }
  }
  dispose() {
    this.listeners.length = 0;
  }
};

// node_modules/@yume-chan/event/esm/sticky-event-emitter.js
var Undefined = Symbol("undefined");
var StickyEventEmitter = class extends EventEmitter {
  #value = Undefined;
  addEventListener(info) {
    if (this.#value !== Undefined) {
      info.listener.call(info.thisArg, this.#value, ...info.args);
    }
    return super.addEventListener(info);
  }
  fire(e) {
    this.#value = e;
    super.fire(e);
  }
};

// node_modules/@yume-chan/adb/esm/commands/base.js
var AdbServiceBase = class extends AutoDisposable {
  #adb;
  get adb() {
    return this.#adb;
  }
  constructor(adb) {
    super();
    this.#adb = adb;
  }
};

// node_modules/@yume-chan/adb/esm/commands/framebuffer.js
var Version = struct({ version: u32 }, { littleEndian: true });
var AdbFrameBufferV1 = struct({
  bpp: u32,
  size: u32,
  width: u32,
  height: u32,
  red_offset: u32,
  red_length: u32,
  blue_offset: u32,
  blue_length: u32,
  green_offset: u32,
  green_length: u32,
  alpha_offset: u32,
  alpha_length: u32,
  data: buffer("size")
}, { littleEndian: true });
var AdbFrameBufferV2 = struct({
  bpp: u32,
  colorSpace: u32,
  size: u32,
  width: u32,
  height: u32,
  red_offset: u32,
  red_length: u32,
  blue_offset: u32,
  blue_length: u32,
  green_offset: u32,
  green_length: u32,
  alpha_offset: u32,
  alpha_length: u32,
  data: buffer("size")
}, { littleEndian: true });
var AdbFrameBufferError = class extends Error {
  constructor(message, options) {
    super(message, options);
  }
};
var AdbFrameBufferUnsupportedVersionError = class extends AdbFrameBufferError {
  constructor(version) {
    super(`Unsupported FrameBuffer version ${version}`);
  }
};
var AdbFrameBufferForbiddenError = class extends AdbFrameBufferError {
  constructor() {
    super("FrameBuffer is disabled by current app");
  }
};
async function framebuffer(adb) {
  const socket = await adb.createSocket("framebuffer:");
  const stream = new BufferedReadableStream(socket.readable);
  let version;
  try {
    ({ version } = await Version.deserialize(stream));
  } catch (e) {
    if (e instanceof StructEmptyError) {
      throw new AdbFrameBufferForbiddenError();
    }
    throw e;
  }
  switch (version) {
    case 1:
      return await AdbFrameBufferV1.deserialize(stream);
    case 2:
      return await AdbFrameBufferV2.deserialize(stream);
    default:
      throw new AdbFrameBufferUnsupportedVersionError(version);
  }
}

// node_modules/@yume-chan/adb/esm/commands/power.js
var AdbPower = class extends AdbServiceBase {
  reboot(mode = "") {
    return this.adb.createSocketAndWait(`reboot:${mode}`);
  }
  bootloader() {
    return this.reboot("bootloader");
  }
  fastboot() {
    return this.reboot("fastboot");
  }
  recovery() {
    return this.reboot("recovery");
  }
  sideload() {
    return this.reboot("sideload");
  }
  /**
   * Reboot to Qualcomm Emergency Download (EDL) Mode.
   *
   * Only works on some Qualcomm devices.
   */
  qualcommEdlMode() {
    return this.reboot("edl");
  }
  powerOff() {
    return this.adb.subprocess.noneProtocol.spawnWaitText(["reboot", "-p"]);
  }
  powerButton(longPress = false) {
    const args = ["input", "keyevent"];
    if (longPress) {
      args.push("--longpress");
    }
    args.push("POWER");
    return this.adb.subprocess.noneProtocol.spawnWaitText(args);
  }
  /**
   * Reboot to Samsung Odin download mode.
   *
   * Only works on Samsung devices.
   */
  samsungOdin() {
    return this.reboot("download");
  }
};

// node_modules/@yume-chan/adb/esm/utils/array-buffer.js
function toLocalUint8Array(value) {
  if (value.buffer instanceof ArrayBuffer) {
    return value;
  }
  const copy = new Uint8Array(value.length);
  copy.set(value);
  return copy;
}

// node_modules/@yume-chan/adb/esm/utils/auto-reset-event.js
var AutoResetEvent = class {
  #set;
  #queue = [];
  constructor(initialSet = false) {
    this.#set = initialSet;
  }
  wait() {
    if (!this.#set) {
      this.#set = true;
      if (this.#queue.length === 0) {
        return Promise.resolve();
      }
    }
    const resolver = new PromiseResolver();
    this.#queue.push(resolver);
    return resolver.promise;
  }
  notifyOne() {
    if (this.#queue.length !== 0) {
      this.#queue.pop().resolve();
    } else {
      this.#set = false;
    }
  }
  dispose() {
    for (const item of this.#queue) {
      item.reject(new Error("The AutoResetEvent has been disposed"));
    }
    this.#queue.length = 0;
  }
};

// node_modules/@yume-chan/adb/esm/utils/base64.js
var [charToIndex, indexToChar, paddingChar] = /* @__PURE__ */ (() => {
  const charToIndex2 = [];
  const indexToChar2 = [];
  const paddingChar2 = "=".charCodeAt(0);
  function addRange(start, end) {
    const charCodeStart = start.charCodeAt(0);
    const charCodeEnd = end.charCodeAt(0);
    for (let charCode = charCodeStart; charCode <= charCodeEnd; charCode += 1) {
      charToIndex2[charCode] = indexToChar2.length;
      indexToChar2.push(charCode);
    }
  }
  addRange("A", "Z");
  addRange("a", "z");
  addRange("0", "9");
  addRange("+", "+");
  addRange("/", "/");
  return [charToIndex2, indexToChar2, paddingChar2];
})();
function calculateBase64EncodedLength(inputLength) {
  const remainder = inputLength % 3;
  const paddingLength = remainder !== 0 ? 3 - remainder : 0;
  return [(inputLength + paddingLength) / 3 * 4, paddingLength];
}
function encodeBase64(input, output) {
  const [outputLength, paddingLength] = calculateBase64EncodedLength(input.length);
  if (!output) {
    output = new Uint8Array(outputLength);
    encodeForward(input, output, paddingLength);
    return output;
  } else {
    if (output.length < outputLength) {
      throw new TypeError("output buffer is too small");
    }
    output = output.subarray(0, outputLength);
    if (input.buffer !== output.buffer) {
      encodeForward(input, output, paddingLength);
    } else if (output.byteOffset + output.length - (paddingLength + 1) <= input.byteOffset + input.length) {
      encodeForward(input, output, paddingLength);
    } else if (output.byteOffset >= input.byteOffset - 1) {
      encodeBackward(input, output, paddingLength);
    } else {
      throw new TypeError("input and output cannot overlap");
    }
    return outputLength;
  }
}
function encodeForward(input, output, paddingLength) {
  let inputIndex = 0;
  let outputIndex = 0;
  while (inputIndex < input.length - 2) {
    const x = input[inputIndex];
    inputIndex += 1;
    const y = input[inputIndex];
    inputIndex += 1;
    const z = input[inputIndex];
    inputIndex += 1;
    output[outputIndex] = indexToChar[x >> 2];
    outputIndex += 1;
    output[outputIndex] = indexToChar[(x & 3) << 4 | y >> 4];
    outputIndex += 1;
    output[outputIndex] = indexToChar[(y & 15) << 2 | z >> 6];
    outputIndex += 1;
    output[outputIndex] = indexToChar[z & 63];
    outputIndex += 1;
  }
  if (paddingLength === 2) {
    const x = input[inputIndex];
    output[outputIndex] = indexToChar[x >> 2];
    outputIndex += 1;
    output[outputIndex] = indexToChar[(x & 3) << 4];
    outputIndex += 1;
    output[outputIndex] = paddingChar;
    outputIndex += 1;
    output[outputIndex] = paddingChar;
  } else if (paddingLength === 1) {
    const x = input[inputIndex];
    inputIndex += 1;
    const y = input[inputIndex];
    output[outputIndex] = indexToChar[x >> 2];
    outputIndex += 1;
    output[outputIndex] = indexToChar[(x & 3) << 4 | y >> 4];
    outputIndex += 1;
    output[outputIndex] = indexToChar[(y & 15) << 2];
    outputIndex += 1;
    output[outputIndex] = paddingChar;
  }
}
function encodeBackward(input, output, paddingLength) {
  let inputIndex = input.length - 1;
  let outputIndex = output.length - 1;
  if (paddingLength === 2) {
    const x = input[inputIndex];
    inputIndex -= 1;
    output[outputIndex] = paddingChar;
    outputIndex -= 1;
    output[outputIndex] = paddingChar;
    outputIndex -= 1;
    output[outputIndex] = indexToChar[(x & 3) << 4];
    outputIndex -= 1;
    output[outputIndex] = indexToChar[x >> 2];
    outputIndex -= 1;
  } else if (paddingLength === 1) {
    const y = input[inputIndex];
    inputIndex -= 1;
    const x = input[inputIndex];
    inputIndex -= 1;
    output[outputIndex] = paddingChar;
    outputIndex -= 1;
    output[outputIndex] = indexToChar[(y & 15) << 2];
    outputIndex -= 1;
    output[outputIndex] = indexToChar[(x & 3) << 4 | y >> 4];
    outputIndex -= 1;
    output[outputIndex] = indexToChar[x >> 2];
    outputIndex -= 1;
  }
  while (inputIndex >= 0) {
    const z = input[inputIndex];
    inputIndex -= 1;
    const y = input[inputIndex];
    inputIndex -= 1;
    const x = input[inputIndex];
    inputIndex -= 1;
    output[outputIndex] = indexToChar[z & 63];
    outputIndex -= 1;
    output[outputIndex] = indexToChar[(y & 15) << 2 | z >> 6];
    outputIndex -= 1;
    output[outputIndex] = indexToChar[(x & 3) << 4 | y >> 4];
    outputIndex -= 1;
    output[outputIndex] = indexToChar[x >> 2];
    outputIndex -= 1;
  }
}

// node_modules/@yume-chan/adb/esm/utils/hex.js
function hexCharToNumber(char) {
  if (char < 48) {
    throw new TypeError(`Invalid hex char ${char}`);
  }
  if (char < 58) {
    return char - 48;
  }
  if (char < 65) {
    throw new TypeError(`Invalid hex char ${char}`);
  }
  if (char < 71) {
    return char - 55;
  }
  if (char < 97) {
    throw new TypeError(`Invalid hex char ${char}`);
  }
  if (char < 103) {
    return char - 87;
  }
  throw new TypeError(`Invalid hex char ${char}`);
}
function hexToNumber(data) {
  let result = 0;
  for (let i = 0; i < data.length; i += 1) {
    result = result << 4 | hexCharToNumber(data[i]);
  }
  return result;
}

// node_modules/@yume-chan/adb/esm/utils/no-op.js
var NOOP2 = /* @__NO_SIDE_EFFECTS__ */ () => {
};
function unreachable(...args) {
  throw new Error("Unreachable. Arguments:\n" + args.join("\n"));
}

// node_modules/@yume-chan/adb/esm/utils/sequence-equal.js
function sequenceEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

// node_modules/@yume-chan/adb/esm/commands/reverse.js
var AdbReverseStringResponse = struct({
  length: string(4),
  content: string({
    field: "length",
    convert(value) {
      return Number.parseInt(value, 16);
    },
    back(value) {
      return value.toString(16).padStart(4, "0");
    }
  })
}, { littleEndian: true });
var AdbReverseError = class extends Error {
  constructor(message) {
    super(message);
  }
};
var AdbReverseNotSupportedError = class extends AdbReverseError {
  constructor() {
    super("ADB reverse tunnel is not supported on this device when connected wirelessly.");
  }
};
var AdbReverseErrorResponse = extend(AdbReverseStringResponse, {}, {
  postDeserialize(value) {
    if (value.content === "more than one device/emulator") {
      throw new AdbReverseNotSupportedError();
    } else {
      throw new AdbReverseError(value.content);
    }
  }
});
function decimalToNumber(buffer2) {
  let value = 0;
  for (const byte of buffer2) {
    if (byte < 48 || byte > 57) {
      return value;
    }
    value = value * 10 + byte - 48;
  }
  return value;
}
var OKAY = encodeUtf8("OKAY");
var AdbReverseService = class extends AdbServiceBase {
  #deviceAddressToLocalAddress = /* @__PURE__ */ new Map();
  async createBufferedStream(service) {
    const socket = await this.adb.createSocket(service);
    return new BufferedReadableStream(socket.readable);
  }
  async sendRequest(service) {
    const stream = await this.createBufferedStream(service);
    const response = await stream.readExactly(4);
    if (!sequenceEqual(response, OKAY)) {
      await AdbReverseErrorResponse.deserialize(stream);
    }
    return stream;
  }
  /**
   * Get a list of all reverse port forwarding on the device.
   */
  async list() {
    const stream = await this.createBufferedStream("reverse:list-forward");
    const response = await AdbReverseStringResponse.deserialize(stream);
    return response.content.split("\n").filter((line) => !!line).map((line) => {
      const [deviceSerial, localName, remoteName] = line.split(" ");
      return { deviceSerial, localName, remoteName };
    });
  }
  /**
   * Add a reverse port forwarding for a program that already listens on a port.
   */
  async addExternal(deviceAddress, localAddress) {
    const stream = await this.sendRequest(`reverse:forward:${deviceAddress};${localAddress}`);
    if (deviceAddress.startsWith("tcp:")) {
      const position = stream.position;
      try {
        const length = hexToNumber(await stream.readExactly(4));
        const port = decimalToNumber(await stream.readExactly(length));
        deviceAddress = `tcp:${port}`;
      } catch (e) {
        if (e instanceof ExactReadableEndedError && stream.position === position) {
        } else {
          throw e;
        }
      }
    }
    return deviceAddress;
  }
  /**
   * Add a reverse port forwarding.
   */
  async add(deviceAddress, handler, localAddress) {
    localAddress = await this.adb.transport.addReverseTunnel(handler, localAddress);
    try {
      deviceAddress = await this.addExternal(deviceAddress, localAddress);
      this.#deviceAddressToLocalAddress.set(deviceAddress, localAddress);
      return deviceAddress;
    } catch (e) {
      await this.adb.transport.removeReverseTunnel(localAddress);
      throw e;
    }
  }
  /**
   * Remove a reverse port forwarding.
   */
  async remove(deviceAddress) {
    const localAddress = this.#deviceAddressToLocalAddress.get(deviceAddress);
    if (localAddress) {
      await this.adb.transport.removeReverseTunnel(localAddress);
    }
    await this.sendRequest(`reverse:killforward:${deviceAddress}`);
  }
  /**
   * Remove all reverse port forwarding, including the ones added by other programs.
   */
  async removeAll() {
    await this.adb.transport.clearReverseTunnels();
    this.#deviceAddressToLocalAddress.clear();
    await this.sendRequest(`reverse:killforward-all`);
  }
};

// node_modules/@yume-chan/adb/esm/commands/subprocess/none/process.js
var AdbNoneProtocolProcessImpl = class {
  #socket;
  get stdin() {
    return this.#socket.writable;
  }
  get output() {
    return this.#socket.readable;
  }
  #exited;
  get exited() {
    return this.#exited;
  }
  constructor(socket, signal) {
    this.#socket = socket;
    if (signal) {
      const exited = new PromiseResolver();
      this.#socket.closed.then(() => exited.resolve(void 0), (e) => exited.reject(e));
      signal.addEventListener("abort", () => {
        exited.reject(signal.reason);
        this.#socket.close();
      });
      this.#exited = exited.promise;
    } else {
      this.#exited = this.#socket.closed;
    }
  }
  kill() {
    return this.#socket.close();
  }
};

// node_modules/@yume-chan/adb/esm/commands/subprocess/none/pty.js
var AdbNoneProtocolPtyProcess = class {
  #socket;
  #writer;
  #input;
  get input() {
    return this.#input;
  }
  get output() {
    return this.#socket.readable;
  }
  get exited() {
    return this.#socket.closed;
  }
  constructor(socket) {
    this.#socket = socket;
    this.#writer = this.#socket.writable.getWriter();
    this.#input = new maybe_consumable_exports.WritableStream({
      write: (chunk) => this.#writer.write(chunk)
    });
  }
  sigint() {
    return this.#writer.write(new Uint8Array([3]));
  }
  kill() {
    return this.#socket.close();
  }
};

// node_modules/@yume-chan/adb/esm/commands/subprocess/utils.js
function escapeArg(s) {
  let result = "";
  result += `'`;
  let base = 0;
  while (true) {
    const found = s.indexOf(`'`, base);
    if (found === -1) {
      result += s.substring(base);
      break;
    }
    result += s.substring(base, found);
    result += String.raw`'\''`;
    base = found + 1;
  }
  result += `'`;
  return result;
}
function splitCommand(command) {
  const result = [];
  let quote;
  let isEscaped = false;
  let start = 0;
  for (let i = 0, len = command.length; i < len; i += 1) {
    if (isEscaped) {
      isEscaped = false;
      continue;
    }
    const char = command.charAt(i);
    switch (char) {
      case " ":
        if (!quote && i !== start) {
          result.push(command.substring(start, i));
          start = i + 1;
        }
        break;
      case "'":
      case '"':
        if (!quote) {
          quote = char;
        } else if (char === quote) {
          quote = void 0;
        }
        break;
      case "\\":
        isEscaped = true;
        break;
    }
  }
  if (start < command.length) {
    result.push(command.substring(start));
  }
  return result;
}

// node_modules/@yume-chan/adb/esm/commands/subprocess/none/spawner.js
var AdbNoneProtocolSpawner = class {
  #spawn;
  constructor(spawn) {
    this.#spawn = spawn;
  }
  spawn(command, signal) {
    signal?.throwIfAborted();
    if (typeof command === "string") {
      command = splitCommand(command);
    }
    return this.#spawn(command, signal);
  }
  async spawnWait(command) {
    const process = await this.spawn(command);
    return await process.output.pipeThrough(new ConcatBufferStream());
  }
  async spawnWaitText(command) {
    const process = await this.spawn(command);
    return await process.output.pipeThrough(new TextDecoderStream()).pipeThrough(new ConcatStringStream());
  }
};

// node_modules/@yume-chan/adb/esm/commands/subprocess/none/service.js
var AdbNoneProtocolSubprocessService = class extends AdbNoneProtocolSpawner {
  #adb;
  get adb() {
    return this.#adb;
  }
  constructor(adb) {
    super(async (command, signal) => {
      const socket = await this.#adb.createSocket(`exec:${command.join(" ")}`);
      if (signal?.aborted) {
        await socket.close();
        throw signal.reason;
      }
      return new AdbNoneProtocolProcessImpl(socket, signal);
    });
    this.#adb = adb;
  }
  async pty(command) {
    if (command === void 0) {
      command = "";
    } else if (Array.isArray(command)) {
      command = command.join(" ");
    }
    return new AdbNoneProtocolPtyProcess(
      // https://github.com/microsoft/typescript/issues/17002
      await this.#adb.createSocket(`shell:${command}`)
    );
  }
};

// node_modules/@yume-chan/adb/esm/features.js
var AdbFeature = {
  ShellV2: "shell_v2",
  Cmd: "cmd",
  StatV2: "stat_v2",
  ListV2: "ls_v2",
  FixedPushMkdir: "fixed_push_mkdir",
  Abb: "abb",
  AbbExec: "abb_exec",
  SendReceiveV2: "sendrecv_v2",
  DelayedAck: "delayed_ack"
};

// node_modules/@yume-chan/adb/esm/commands/subprocess/shell/shared.js
var AdbShellProtocolId = {
  Stdin: 0,
  Stdout: 1,
  Stderr: 2,
  Exit: 3,
  CloseStdin: 4,
  WindowSizeChange: 5
};
var AdbShellProtocolPacket = struct({
  id: u8(),
  data: buffer(u32)
}, { littleEndian: true });

// node_modules/@yume-chan/adb/esm/commands/subprocess/shell/process.js
var AdbShellProtocolProcessImpl = class {
  #socket;
  #writer;
  #stdin;
  get stdin() {
    return this.#stdin;
  }
  #stdout;
  get stdout() {
    return this.#stdout;
  }
  #stderr;
  get stderr() {
    return this.#stderr;
  }
  #exited;
  get exited() {
    return this.#exited;
  }
  constructor(socket, signal) {
    this.#socket = socket;
    let stdoutController;
    let stderrController;
    this.#stdout = new PushReadableStream((controller) => {
      stdoutController = controller;
    });
    this.#stderr = new PushReadableStream((controller) => {
      stderrController = controller;
    });
    const exited = new PromiseResolver();
    this.#exited = exited.promise;
    socket.readable.pipeThrough(new StructDeserializeStream(AdbShellProtocolPacket)).pipeTo(new WritableStream({
      write: async (chunk) => {
        switch (chunk.id) {
          case AdbShellProtocolId.Exit:
            exited.resolve(chunk.data[0]);
            break;
          case AdbShellProtocolId.Stdout:
            await stdoutController.enqueue(chunk.data);
            break;
          case AdbShellProtocolId.Stderr:
            await stderrController.enqueue(chunk.data);
            break;
          default:
            break;
        }
      }
    })).then(() => {
      stdoutController.close();
      stderrController.close();
      exited.reject(new Error("Socket ended without exit message"));
    }, (e) => {
      stdoutController.error(e);
      stderrController.error(e);
      exited.reject(e);
    });
    if (signal) {
      signal.addEventListener("abort", () => {
        exited.reject(signal.reason);
        this.#socket.close();
      });
    }
    this.#writer = this.#socket.writable.getWriter();
    this.#stdin = new maybe_consumable_exports.WritableStream({
      write: async (chunk) => {
        await this.#writer.write(AdbShellProtocolPacket.serialize({
          id: AdbShellProtocolId.Stdin,
          data: chunk
        }));
      },
      close: () => (
        // Only shell protocol + raw mode supports closing stdin
        this.#writer.write(AdbShellProtocolPacket.serialize({
          id: AdbShellProtocolId.CloseStdin,
          data: EmptyUint8Array
        }))
      )
    });
  }
  kill() {
    return this.#socket.close();
  }
};

// node_modules/@yume-chan/adb/esm/commands/subprocess/shell/pty.js
var AdbShellProtocolPtyProcess = class {
  #socket;
  #writer;
  #input;
  get input() {
    return this.#input;
  }
  #stdout;
  get output() {
    return this.#stdout;
  }
  #exited = new PromiseResolver();
  get exited() {
    return this.#exited.promise;
  }
  constructor(socket) {
    this.#socket = socket;
    let stdoutController;
    this.#stdout = new PushReadableStream((controller) => {
      stdoutController = controller;
    });
    socket.readable.pipeThrough(new StructDeserializeStream(AdbShellProtocolPacket)).pipeTo(new WritableStream({
      write: async (chunk) => {
        switch (chunk.id) {
          case AdbShellProtocolId.Exit:
            this.#exited.resolve(chunk.data[0]);
            break;
          case AdbShellProtocolId.Stdout:
            await stdoutController.enqueue(chunk.data);
            break;
        }
      }
    })).then(() => {
      stdoutController.close();
      this.#exited.reject(new Error("Socket ended without exit message"));
    }, (e) => {
      stdoutController.error(e);
      this.#exited.reject(e);
    });
    this.#writer = this.#socket.writable.getWriter();
    this.#input = new maybe_consumable_exports.WritableStream({
      write: (chunk) => this.#writeStdin(chunk)
    });
  }
  #writeStdin(chunk) {
    return this.#writer.write(AdbShellProtocolPacket.serialize({
      id: AdbShellProtocolId.Stdin,
      data: chunk
    }));
  }
  async resize(rows, cols) {
    await this.#writer.write(AdbShellProtocolPacket.serialize({
      id: AdbShellProtocolId.WindowSizeChange,
      // The "correct" format is `${rows}x${cols},${x_pixels}x${y_pixels}`
      // However, according to https://linux.die.net/man/4/tty_ioctl
      // `x_pixels` and `y_pixels` are unused, so always sending `0` should be fine.
      data: encodeUtf8(`${rows}x${cols},0x0\0`)
    }));
  }
  sigint() {
    return this.#writeStdin(new Uint8Array([3]));
  }
  kill() {
    return this.#socket.close();
  }
};

// node_modules/@yume-chan/adb/esm/commands/subprocess/shell/spawner.js
var AdbShellProtocolSpawner = class {
  #spawn;
  constructor(spawn) {
    this.#spawn = spawn;
  }
  spawn(command, signal) {
    signal?.throwIfAborted();
    if (typeof command === "string") {
      command = splitCommand(command);
    }
    return this.#spawn(command, signal);
  }
  async spawnWait(command) {
    const process = await this.spawn(command);
    const [stdout, stderr, exitCode] = await Promise.all([
      process.stdout.pipeThrough(new ConcatBufferStream()),
      process.stderr.pipeThrough(new ConcatBufferStream()),
      process.exited
    ]);
    return { stdout, stderr, exitCode };
  }
  async spawnWaitText(command) {
    const process = await this.spawn(command);
    const [stdout, stderr, exitCode] = await Promise.all([
      process.stdout.pipeThrough(new TextDecoderStream()).pipeThrough(new ConcatStringStream()),
      process.stderr.pipeThrough(new TextDecoderStream()).pipeThrough(new ConcatStringStream()),
      process.exited
    ]);
    return { stdout, stderr, exitCode };
  }
};

// node_modules/@yume-chan/adb/esm/commands/subprocess/shell/service.js
var AdbShellProtocolSubprocessService = class extends AdbShellProtocolSpawner {
  #adb;
  get adb() {
    return this.#adb;
  }
  get isSupported() {
    return this.#adb.canUseFeature(AdbFeature.ShellV2);
  }
  constructor(adb) {
    super(async (command, signal) => {
      const socket = await this.#adb.createSocket(`shell,v2,raw:${command.join(" ")}`);
      if (signal?.aborted) {
        await socket.close();
        throw signal.reason;
      }
      return new AdbShellProtocolProcessImpl(socket, signal);
    });
    this.#adb = adb;
  }
  async pty(options) {
    let service = "shell,v2,pty";
    if (options?.terminalType) {
      service += `,TERM=` + options.terminalType;
    }
    service += ":";
    if (options) {
      if (typeof options.command === "string") {
        service += options.command;
      } else if (Array.isArray(options.command)) {
        service += options.command.join(" ");
      }
    }
    return new AdbShellProtocolPtyProcess(await this.#adb.createSocket(service));
  }
};

// node_modules/@yume-chan/adb/esm/commands/subprocess/service.js
var AdbSubprocessService = class {
  #adb;
  get adb() {
    return this.#adb;
  }
  #noneProtocol;
  get noneProtocol() {
    return this.#noneProtocol;
  }
  #shellProtocol;
  get shellProtocol() {
    return this.#shellProtocol;
  }
  constructor(adb) {
    this.#adb = adb;
    this.#noneProtocol = new AdbNoneProtocolSubprocessService(adb);
    if (adb.canUseFeature(AdbFeature.ShellV2)) {
      this.#shellProtocol = new AdbShellProtocolSubprocessService(adb);
    }
  }
};

// node_modules/@yume-chan/adb/esm/commands/sync/response.js
function encodeAsciiUnchecked(value) {
  const result = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i += 1) {
    result[i] = value.charCodeAt(i);
  }
  return result;
}
// @__NO_SIDE_EFFECTS__
function adbSyncEncodeId(value) {
  const buffer2 = encodeAsciiUnchecked(value);
  return getUint32LittleEndian(buffer2, 0);
}
var AdbSyncResponseId = {
  Entry: /* @__PURE__ */ adbSyncEncodeId("DENT"),
  Entry2: /* @__PURE__ */ adbSyncEncodeId("DNT2"),
  Lstat: /* @__PURE__ */ adbSyncEncodeId("STAT"),
  Stat: /* @__PURE__ */ adbSyncEncodeId("STA2"),
  Lstat2: /* @__PURE__ */ adbSyncEncodeId("LST2"),
  Done: /* @__PURE__ */ adbSyncEncodeId("DONE"),
  Data: /* @__PURE__ */ adbSyncEncodeId("DATA"),
  Ok: /* @__PURE__ */ adbSyncEncodeId("OKAY"),
  Fail: /* @__PURE__ */ adbSyncEncodeId("FAIL")
};
var AdbSyncError = class extends Error {
};
var AdbSyncFailResponse = struct({ message: string(u32) }, {
  littleEndian: true,
  postDeserialize(value) {
    throw new AdbSyncError(value.message);
  }
});
async function adbSyncReadResponse(stream, id, type) {
  if (typeof id === "string") {
    id = /* @__PURE__ */ adbSyncEncodeId(id);
  }
  const buffer2 = await stream.readExactly(4);
  switch (getUint32LittleEndian(buffer2, 0)) {
    case AdbSyncResponseId.Fail:
      await AdbSyncFailResponse.deserialize(stream);
      throw new Error("Unreachable");
    case id:
      return await type.deserialize(stream);
    default:
      throw new Error(`Expected '${id}', but got '${decodeUtf8(buffer2)}'`);
  }
}
async function* adbSyncReadResponses(stream, id, type) {
  if (typeof id === "string") {
    id = /* @__PURE__ */ adbSyncEncodeId(id);
  }
  while (true) {
    const buffer2 = await stream.readExactly(4);
    switch (getUint32LittleEndian(buffer2, 0)) {
      case AdbSyncResponseId.Fail:
        await AdbSyncFailResponse.deserialize(stream);
        unreachable();
      case AdbSyncResponseId.Done:
        await stream.readExactly(type.size);
        return;
      case id:
        yield await type.deserialize(stream);
        break;
      default:
        throw new Error(`Expected '${id}' or '${AdbSyncResponseId.Done}', but got '${decodeUtf8(buffer2)}'`);
    }
  }
}

// node_modules/@yume-chan/adb/esm/commands/sync/request.js
var AdbSyncRequestId = {
  List: adbSyncEncodeId("LIST"),
  ListV2: adbSyncEncodeId("LIS2"),
  Send: adbSyncEncodeId("SEND"),
  SendV2: adbSyncEncodeId("SND2"),
  Lstat: adbSyncEncodeId("STAT"),
  Stat: adbSyncEncodeId("STA2"),
  LstatV2: adbSyncEncodeId("LST2"),
  Data: adbSyncEncodeId("DATA"),
  Done: adbSyncEncodeId("DONE"),
  Receive: adbSyncEncodeId("RECV")
};
var AdbSyncNumberRequest = struct({ id: u32, arg: u32 }, { littleEndian: true });
async function adbSyncWriteRequest(writable, id, value) {
  if (typeof id === "string") {
    id = adbSyncEncodeId(id);
  }
  if (typeof value === "number") {
    await writable.write(AdbSyncNumberRequest.serialize({ id, arg: value }));
    return;
  }
  if (typeof value === "string") {
    value = encodeUtf8(value);
  }
  await writable.write(AdbSyncNumberRequest.serialize({ id, arg: value.length }));
  await writable.write(value);
}

// node_modules/@yume-chan/adb/esm/commands/sync/stat.js
var LinuxFileType = {
  Directory: 4,
  File: 8,
  Link: 10
};
var AdbSyncLstatResponse = struct({ mode: u32, size: u32, mtime: u32 }, {
  littleEndian: true,
  extra: {
    get type() {
      return this.mode >> 12;
    },
    get permission() {
      return this.mode & 4095;
    }
  },
  postDeserialize(value) {
    if (value.mode === 0 && value.size === 0 && value.mtime === 0) {
      throw new Error("lstat error");
    }
    return value;
  }
});
var AdbSyncStatErrorCode = {
  SUCCESS: 0,
  EACCES: 13,
  EEXIST: 17,
  EFAULT: 14,
  EFBIG: 27,
  EINTR: 4,
  EINVAL: 22,
  EIO: 5,
  EISDIR: 21,
  ELOOP: 40,
  EMFILE: 24,
  ENAMETOOLONG: 36,
  ENFILE: 23,
  ENOENT: 2,
  ENOMEM: 12,
  ENOSPC: 28,
  ENOTDIR: 20,
  EOVERFLOW: 75,
  EPERM: 1,
  EROFS: 30,
  ETXTBSY: 26
};
var AdbSyncStatErrorName = /* @__PURE__ */ (() => Object.fromEntries(Object.entries(AdbSyncStatErrorCode).map(([key, value]) => [
  value,
  key
])))();
var AdbSyncStatResponse = struct({
  error: u32(),
  dev: u64,
  ino: u64,
  mode: u32,
  nlink: u32,
  uid: u32,
  gid: u32,
  size: u64,
  atime: u64,
  mtime: u64,
  ctime: u64
}, {
  littleEndian: true,
  extra: {
    get type() {
      return this.mode >> 12;
    },
    get permission() {
      return this.mode & 4095;
    }
  },
  postDeserialize(value) {
    if (value.error) {
      throw new Error(AdbSyncStatErrorName[value.error]);
    }
    return value;
  }
});
async function adbSyncLstat(socket, path, v2) {
  const locked = await socket.lock();
  try {
    if (v2) {
      await adbSyncWriteRequest(locked, AdbSyncRequestId.LstatV2, path);
      return await adbSyncReadResponse(locked, AdbSyncResponseId.Lstat2, AdbSyncStatResponse);
    } else {
      await adbSyncWriteRequest(locked, AdbSyncRequestId.Lstat, path);
      const response = await adbSyncReadResponse(locked, AdbSyncResponseId.Lstat, AdbSyncLstatResponse);
      return {
        mode: response.mode,
        // Convert to `BigInt` to make it compatible with `AdbSyncStatResponse`
        size: BigInt(response.size),
        mtime: BigInt(response.mtime),
        get type() {
          return response.type;
        },
        get permission() {
          return response.permission;
        }
      };
    }
  } finally {
    locked.release();
  }
}
async function adbSyncStat(socket, path) {
  const locked = await socket.lock();
  try {
    await adbSyncWriteRequest(locked, AdbSyncRequestId.Stat, path);
    return await adbSyncReadResponse(locked, AdbSyncResponseId.Stat, AdbSyncStatResponse);
  } finally {
    locked.release();
  }
}

// node_modules/@yume-chan/adb/esm/commands/sync/list.js
var AdbSyncEntryResponse = extend(AdbSyncLstatResponse, {
  name: string(u32)
});
var AdbSyncEntry2Response = extend(AdbSyncStatResponse, {
  name: string(u32)
});
async function* adbSyncOpenDirV2(socket, path) {
  const locked = await socket.lock();
  try {
    await adbSyncWriteRequest(locked, AdbSyncRequestId.ListV2, path);
    for await (const item of adbSyncReadResponses(locked, AdbSyncResponseId.Entry2, AdbSyncEntry2Response)) {
      if (item.error !== AdbSyncStatErrorCode.SUCCESS) {
        continue;
      }
      yield item;
    }
  } finally {
    locked.release();
  }
}
async function* adbSyncOpenDirV1(socket, path) {
  const locked = await socket.lock();
  try {
    await adbSyncWriteRequest(locked, AdbSyncRequestId.List, path);
    for await (const item of adbSyncReadResponses(locked, AdbSyncResponseId.Entry, AdbSyncEntryResponse)) {
      yield item;
    }
  } finally {
    locked.release();
  }
}
async function* adbSyncOpenDir(socket, path, v2) {
  if (v2) {
    yield* adbSyncOpenDirV2(socket, path);
  } else {
    for await (const item of adbSyncOpenDirV1(socket, path)) {
      yield {
        mode: item.mode,
        size: BigInt(item.size),
        mtime: BigInt(item.mtime),
        get type() {
          return item.type;
        },
        get permission() {
          return item.permission;
        },
        name: item.name
      };
    }
  }
}

// node_modules/@yume-chan/adb/esm/commands/sync/pull.js
var AdbSyncDataResponse = struct({ data: buffer(u32) }, { littleEndian: true });
async function* adbSyncPullGenerator(socket, path) {
  const locked = await socket.lock();
  let done = false;
  try {
    await adbSyncWriteRequest(locked, AdbSyncRequestId.Receive, path);
    for await (const packet of adbSyncReadResponses(locked, AdbSyncResponseId.Data, AdbSyncDataResponse)) {
      yield packet.data;
    }
    done = true;
  } catch (e) {
    done = true;
    throw e;
  } finally {
    if (!done) {
      for await (const packet of adbSyncReadResponses(locked, AdbSyncResponseId.Data, AdbSyncDataResponse)) {
        void packet;
      }
    }
    locked.release();
  }
}
function adbSyncPull(socket, path) {
  return ReadableStream2.from(adbSyncPullGenerator(socket, path));
}

// node_modules/@yume-chan/adb/esm/commands/sync/push.js
var ADB_SYNC_MAX_PACKET_SIZE = 64 * 1024;
var AdbSyncOkResponse = struct({ unused: u32 }, { littleEndian: true });
async function pipeFileData(locked, file, packetSize, mtime) {
  const abortController = new AbortController();
  file.pipeThrough(new DistributionStream(packetSize, true)).pipeTo(new maybe_consumable_exports.WritableStream({
    write(chunk) {
      return adbSyncWriteRequest(locked, AdbSyncRequestId.Data, chunk);
    }
  }), { signal: abortController.signal }).then(async () => {
    await adbSyncWriteRequest(locked, AdbSyncRequestId.Done, mtime);
    await locked.flush();
  }, NOOP2);
  await adbSyncReadResponse(locked, AdbSyncResponseId.Ok, AdbSyncOkResponse).catch((e) => {
    abortController.abort();
    throw e;
  });
}
async function adbSyncPushV1({ socket, filename, file, type = LinuxFileType.File, permission = 438, mtime = Date.now() / 1e3 | 0, packetSize = ADB_SYNC_MAX_PACKET_SIZE }) {
  const locked = await socket.lock();
  try {
    const mode = type << 12 | permission;
    const pathAndMode = `${filename},${mode.toString()}`;
    await adbSyncWriteRequest(locked, AdbSyncRequestId.Send, pathAndMode);
    await pipeFileData(locked, file, packetSize, mtime);
  } finally {
    locked.release();
  }
}
var AdbSyncSendV2Flags = {
  None: 0,
  Brotli: 1,
  /**
   * 2
   */
  Lz4: 1 << 1,
  /**
   * 4
   */
  Zstd: 1 << 2,
  DryRun: 2147483648
};
var AdbSyncSendV2Request = struct({ id: u32, mode: u32, flags: u32() }, { littleEndian: true });
async function adbSyncPushV2({ socket, filename, file, type = LinuxFileType.File, permission = 438, mtime = Date.now() / 1e3 | 0, packetSize = ADB_SYNC_MAX_PACKET_SIZE, dryRun = false }) {
  const locked = await socket.lock();
  try {
    await adbSyncWriteRequest(locked, AdbSyncRequestId.SendV2, filename);
    const mode = type << 12 | permission;
    let flags = AdbSyncSendV2Flags.None;
    if (dryRun) {
      flags |= AdbSyncSendV2Flags.DryRun;
    }
    await locked.write(AdbSyncSendV2Request.serialize({
      id: AdbSyncRequestId.SendV2,
      mode,
      flags
    }));
    await pipeFileData(locked, file, packetSize, mtime);
  } finally {
    locked.release();
  }
}
function adbSyncPush(options) {
  if (options.v2) {
    return adbSyncPushV2(options);
  }
  if (options.dryRun) {
    throw new Error("dryRun is not supported in v1");
  }
  return adbSyncPushV1(options);
}

// node_modules/@yume-chan/adb/esm/commands/sync/socket.js
var AdbSyncSocketLocked = class {
  #writer;
  #readable;
  #socketLock;
  #writeLock = new AutoResetEvent();
  #combiner;
  get position() {
    return this.#readable.position;
  }
  constructor(writer, readable, bufferSize, lock) {
    this.#writer = writer;
    this.#readable = readable;
    this.#socketLock = lock;
    this.#combiner = new BufferCombiner(bufferSize);
  }
  #write(buffer2) {
    return Consumable.WritableStream.write(this.#writer, buffer2);
  }
  async flush() {
    try {
      await this.#writeLock.wait();
      const buffer2 = this.#combiner.flush();
      if (buffer2) {
        await this.#write(buffer2);
      }
    } finally {
      this.#writeLock.notifyOne();
    }
  }
  async write(data) {
    try {
      await this.#writeLock.wait();
      for (const buffer2 of this.#combiner.push(data)) {
        await this.#write(buffer2);
      }
    } finally {
      this.#writeLock.notifyOne();
    }
  }
  async readExactly(length) {
    await this.flush();
    return await this.#readable.readExactly(length);
  }
  release() {
    this.#combiner.flush();
    this.#socketLock.notifyOne();
  }
  async close() {
    await this.#readable.cancel();
  }
};
var AdbSyncSocket = class {
  #lock = new AutoResetEvent();
  #socket;
  #locked;
  constructor(socket, bufferSize) {
    this.#socket = socket;
    this.#locked = new AdbSyncSocketLocked(socket.writable.getWriter(), new BufferedReadableStream(socket.readable), bufferSize, this.#lock);
  }
  async lock() {
    await this.#lock.wait();
    return this.#locked;
  }
  async close() {
    await this.#locked.close();
    await this.#socket.close();
  }
};

// node_modules/@yume-chan/adb/esm/commands/sync/sync.js
function dirname(path) {
  const end = path.lastIndexOf("/");
  if (end === -1) {
    throw new Error(`Invalid path`);
  }
  if (end === 0) {
    return "/";
  }
  return path.substring(0, end);
}
var AdbSync = class {
  _adb;
  _socket;
  #supportsStat;
  #supportsListV2;
  #fixedPushMkdir;
  #supportsSendReceiveV2;
  #needPushMkdirWorkaround;
  get supportsStat() {
    return this.#supportsStat;
  }
  get supportsListV2() {
    return this.#supportsListV2;
  }
  get fixedPushMkdir() {
    return this.#fixedPushMkdir;
  }
  get supportsSendReceiveV2() {
    return this.#supportsSendReceiveV2;
  }
  get needPushMkdirWorkaround() {
    return this.#needPushMkdirWorkaround;
  }
  constructor(adb, socket) {
    this._adb = adb;
    this._socket = new AdbSyncSocket(socket, adb.maxPayloadSize);
    this.#supportsStat = adb.canUseFeature(AdbFeature.StatV2);
    this.#supportsListV2 = adb.canUseFeature(AdbFeature.ListV2);
    this.#fixedPushMkdir = adb.canUseFeature(AdbFeature.FixedPushMkdir);
    this.#supportsSendReceiveV2 = adb.canUseFeature(AdbFeature.SendReceiveV2);
    this.#needPushMkdirWorkaround = this._adb.canUseFeature(AdbFeature.ShellV2) && !this.fixedPushMkdir;
  }
  /**
   * Gets information of a file or folder.
   *
   * If `path` points to a symbolic link, the returned information is about the link itself (with `type` being `LinuxFileType.Link`).
   */
  async lstat(path) {
    return await adbSyncLstat(this._socket, path, this.#supportsStat);
  }
  /**
   * Gets the information of a file or folder.
   *
   * If `path` points to a symbolic link, it will be resolved and the returned information is about the target (with `type` being `LinuxFileType.File` or `LinuxFileType.Directory`).
   */
  async stat(path) {
    if (!this.#supportsStat) {
      throw new Error("Not supported");
    }
    return await adbSyncStat(this._socket, path);
  }
  /**
   * Checks if `path` is a directory, or a symbolic link to a directory.
   *
   * This uses `lstat` internally, thus works on all Android versions.
   */
  async isDirectory(path) {
    try {
      await this.lstat(path + "/");
      return true;
    } catch {
      return false;
    }
  }
  opendir(path) {
    return adbSyncOpenDir(this._socket, path, this.supportsListV2);
  }
  async readdir(path) {
    const results = [];
    for await (const entry of this.opendir(path)) {
      results.push(entry);
    }
    return results;
  }
  /**
   * Reads the content of a file on device.
   *
   * @param filename The full path of the file on device to read.
   * @returns A `ReadableStream` that contains the file content.
   */
  read(filename) {
    return adbSyncPull(this._socket, filename);
  }
  /**
   * Writes a file on device. If the file name already exists, it will be overwritten.
   *
   * @param options The content and options of the file to write.
   */
  async write(options) {
    if (this.needPushMkdirWorkaround) {
      await this._adb.subprocess.noneProtocol.spawnWait([
        "mkdir",
        "-p",
        escapeArg(dirname(options.filename))
      ]);
    }
    await adbSyncPush({
      v2: this.supportsSendReceiveV2,
      socket: this._socket,
      ...options
    });
  }
  lockSocket() {
    return this._socket.lock();
  }
  dispose() {
    return this._socket.close();
  }
};

// node_modules/@yume-chan/adb/esm/commands/tcpip.js
function parsePort(value) {
  if (!value || value === "0") {
    return void 0;
  }
  return Number.parseInt(value, 10);
}
var AdbTcpIpService = class extends AdbServiceBase {
  async getListenAddresses() {
    const serviceListenAddresses = await this.adb.getProp("service.adb.listen_addrs");
    const servicePort = await this.adb.getProp("service.adb.tcp.port");
    const persistPort = await this.adb.getProp("persist.adb.tcp.port");
    return {
      serviceListenAddresses: serviceListenAddresses != "" ? serviceListenAddresses.split(",") : [],
      servicePort: parsePort(servicePort),
      persistPort: parsePort(persistPort)
    };
  }
  async setPort(port) {
    if (port <= 0) {
      throw new TypeError(`Invalid port ${port}`);
    }
    const output = await this.adb.createSocketAndWait(`tcpip:${port}`);
    if (output !== `restarting in TCP mode port: ${port}
`) {
      throw new Error(output);
    }
    return output;
  }
  async disable() {
    const output = await this.adb.createSocketAndWait("usb:");
    if (output !== "restarting in USB mode\n") {
      throw new Error(output);
    }
    return output;
  }
};

// node_modules/@yume-chan/adb/esm/adb.js
var Adb = class {
  #transport;
  get transport() {
    return this.#transport;
  }
  get serial() {
    return this.#transport.serial;
  }
  get maxPayloadSize() {
    return this.#transport.maxPayloadSize;
  }
  get banner() {
    return this.#transport.banner;
  }
  get disconnected() {
    return this.#transport.disconnected;
  }
  get clientFeatures() {
    return this.#transport.clientFeatures;
  }
  get deviceFeatures() {
    return this.banner.features;
  }
  subprocess;
  power;
  reverse;
  tcpip;
  constructor(transport) {
    this.#transport = transport;
    this.subprocess = new AdbSubprocessService(this);
    this.power = new AdbPower(this);
    this.reverse = new AdbReverseService(this);
    this.tcpip = new AdbTcpIpService(this);
  }
  canUseFeature(feature) {
    return this.clientFeatures.includes(feature) && this.deviceFeatures.includes(feature);
  }
  /**
   * Creates a new ADB Socket to the specified service or socket address.
   */
  async createSocket(service) {
    return this.#transport.connect(service);
  }
  async createSocketAndWait(service) {
    const socket = await this.createSocket(service);
    return await socket.readable.pipeThrough(new TextDecoderStream()).pipeThrough(new ConcatStringStream());
  }
  getProp(key) {
    return this.subprocess.noneProtocol.spawnWaitText(["getprop", key]).then((output) => output.trim());
  }
  rm(filenames, options) {
    const args = ["rm"];
    if (options?.recursive) {
      args.push("-r");
    }
    if (options?.force) {
      args.push("-f");
    }
    if (Array.isArray(filenames)) {
      for (const filename of filenames) {
        args.push(escapeArg(filename));
      }
    } else {
      args.push(escapeArg(filenames));
    }
    args.push("</dev/null");
    return this.subprocess.noneProtocol.spawnWaitText(args);
  }
  async sync() {
    const socket = await this.createSocket("sync:");
    return new AdbSync(this, socket);
  }
  async framebuffer() {
    return framebuffer(this);
  }
  async close() {
    await this.#transport.close();
  }
};

// node_modules/@yume-chan/adb/esm/banner.js
var AdbBannerKey = {
  Product: "ro.product.name",
  Model: "ro.product.model",
  Device: "ro.product.device",
  Features: "features"
};
var AdbBanner = class _AdbBanner {
  static parse(banner) {
    let state;
    let product;
    let model;
    let device;
    let features = [];
    const pieces = banner.split("::");
    if (pieces.length > 1) {
      state = pieces[0].trim() || void 0;
      const props = pieces[1];
      for (const prop of props.split(";")) {
        if (!prop) {
          continue;
        }
        const keyValue = prop.split("=");
        if (keyValue.length !== 2) {
          continue;
        }
        const [key, value] = keyValue;
        switch (key) {
          case AdbBannerKey.Product:
            product = value;
            break;
          case AdbBannerKey.Model:
            model = value;
            break;
          case AdbBannerKey.Device:
            device = value;
            break;
          case AdbBannerKey.Features:
            features = value.split(",");
            break;
        }
      }
    }
    return new _AdbBanner(state, product, model, device, features);
  }
  #state;
  get state() {
    return this.#state;
  }
  #product;
  get product() {
    return this.#product;
  }
  #model;
  get model() {
    return this.#model;
  }
  #device;
  get device() {
    return this.#device;
  }
  #features = [];
  get features() {
    return this.#features;
  }
  // eslint-disable-next-line @typescript-eslint/max-params
  constructor(state, product, model, device, features) {
    this.#state = state;
    this.#product = product;
    this.#model = model;
    this.#device = device;
    this.#features = features;
  }
};

// node_modules/@yume-chan/adb/esm/daemon/crypto.js
function getBigUint(array, byteOffset, length) {
  let result = 0n;
  for (let j = 0; j < length % 8; j += 1) {
    result = result << 8n | BigInt(array[byteOffset + j]);
  }
  for (let i = byteOffset + length % 8; i < byteOffset + length; i += 8) {
    result <<= 64n;
    const value = getUint64BigEndian(array, i);
    result |= value;
  }
  return result;
}
function setBigUint(array, byteOffset, length, value, littleEndian) {
  if (littleEndian) {
    while (value > 0n) {
      setInt64LittleEndian(array, byteOffset, value);
      byteOffset += 8;
      value >>= 64n;
    }
  } else {
    let position = byteOffset + length - 8;
    while (value > 0n) {
      setInt64BigEndian(array, position, value);
      position -= 8;
      value >>= 64n;
    }
  }
}
function derHeader(data, offset) {
  offset = offset + 1;
  let length = data[offset];
  offset += 1;
  if (length & 128) {
    const lengthBytes = length & 127;
    length = 0;
    for (let i = 0; i < lengthBytes; i += 1) {
      length = length << 8 | data[offset];
      offset += 1;
    }
  }
  return { offset, length };
}
function rsaParsePrivateKey(key) {
  let offset = derHeader(key, 0).offset;
  let header = derHeader(key, offset);
  offset = header.offset + header.length;
  header = derHeader(key, offset);
  offset = header.offset + header.length;
  offset = derHeader(key, offset).offset;
  offset = derHeader(key, offset).offset;
  header = derHeader(key, offset);
  offset = header.offset + header.length;
  const nHeader = derHeader(key, offset);
  offset = nHeader.offset + nHeader.length;
  const eHeader = derHeader(key, offset);
  offset = eHeader.offset + eHeader.length;
  const dHeader = derHeader(key, offset);
  const n = getBigUint(key, nHeader.offset, nHeader.length);
  const d = getBigUint(key, dHeader.offset, dHeader.length);
  return [n, d];
}
function nonNegativeMod(m, d) {
  const r = m % d;
  if (r > 0) {
    return r;
  }
  return r + (d > 0 ? d : -d);
}
function modInverse(a, m) {
  a = nonNegativeMod(a, m);
  if (!a || m < 2) {
    return NaN;
  }
  const s = [];
  let b = m;
  while (b) {
    [a, b] = [b, a % b];
    s.push({ a, b });
  }
  if (a !== 1) {
    return NaN;
  }
  let x = 1;
  let y = 0;
  for (let i = s.length - 2; i >= 0; i -= 1) {
    [x, y] = [y, x - y * Math.floor(s[i].a / s[i].b)];
  }
  return nonNegativeMod(y, m);
}
var ModulusLengthInBytes = 2048 / 8;
var ModulusLengthInWords = ModulusLengthInBytes / 4;
function adbGetPublicKeySize() {
  return 4 + 4 + ModulusLengthInBytes + ModulusLengthInBytes + 4;
}
function adbGeneratePublicKey(privateKey, output) {
  let outputType;
  const outputLength = adbGetPublicKeySize();
  if (!output) {
    output = new Uint8Array(outputLength);
    outputType = "Uint8Array";
  } else {
    if (output.length < outputLength) {
      throw new TypeError("output buffer is too small");
    }
    outputType = "number";
  }
  const outputView = new DataView(output.buffer, output.byteOffset, output.length);
  let outputOffset = 0;
  outputView.setUint32(outputOffset, ModulusLengthInWords, true);
  outputOffset += 4;
  const [n] = rsaParsePrivateKey(privateKey);
  const n0inv = -modInverse(Number(n % 2n ** 32n), 2 ** 32);
  outputView.setInt32(outputOffset, n0inv, true);
  outputOffset += 4;
  setBigUint(output, outputOffset, ModulusLengthInBytes, n, true);
  outputOffset += ModulusLengthInBytes;
  const rr = 2n ** 4096n % n;
  setBigUint(output, outputOffset, ModulusLengthInBytes, rr, true);
  outputOffset += ModulusLengthInBytes;
  outputView.setUint32(outputOffset, 65537, true);
  if (outputType === "Uint8Array") {
    return output;
  } else {
    return outputLength;
  }
}
function powMod(base, exponent, modulus) {
  if (modulus === 1n) {
    return 0n;
  }
  let r = 1n;
  base = base % modulus;
  while (exponent > 0n) {
    if (BigInt.asUintN(1, exponent) === 1n) {
      r = r * base % modulus;
    }
    base = base * base % modulus;
    exponent >>= 1n;
  }
  return r;
}
var SHA1_DIGEST_LENGTH = 20;
var ASN1_SEQUENCE = 48;
var ASN1_OCTET_STRING = 4;
var ASN1_NULL = 5;
var ASN1_OID = 6;
var SHA1_DIGEST_INFO = new Uint8Array([
  ASN1_SEQUENCE,
  13 + SHA1_DIGEST_LENGTH,
  ASN1_SEQUENCE,
  9,
  // SHA-1 (1 3 14 3 2 26)
  ASN1_OID,
  5,
  1 * 40 + 3,
  14,
  3,
  2,
  26,
  ASN1_NULL,
  0,
  ASN1_OCTET_STRING,
  SHA1_DIGEST_LENGTH
]);
function rsaSign(privateKey, data) {
  const [n, d] = rsaParsePrivateKey(privateKey);
  const padded = new Uint8Array(256);
  let index = 0;
  padded[index] = 0;
  index += 1;
  padded[index] = 1;
  index += 1;
  const fillLength = padded.length - SHA1_DIGEST_INFO.length - data.length - 1;
  while (index < fillLength) {
    padded[index] = 255;
    index += 1;
  }
  padded[index] = 0;
  index += 1;
  padded.set(SHA1_DIGEST_INFO, index);
  index += SHA1_DIGEST_INFO.length;
  padded.set(data, index);
  const signature = powMod(getBigUint(padded, 0, padded.length), d, n);
  setBigUint(padded, 0, padded.length, signature, false);
  return padded;
}

// node_modules/@yume-chan/adb/esm/daemon/packet.js
var AdbCommand = {
  Auth: 1213486401,
  // 'AUTH'
  Close: 1163086915,
  // 'CLSE'
  Connect: 1314410051,
  // 'CNXN'
  Okay: 1497451343,
  // 'OKAY'
  Open: 1313165391,
  // 'OPEN'
  Write: 1163154007
  // 'WRTE'
};
var AdbPacketHeader = struct({
  command: u32,
  arg0: u32,
  arg1: u32,
  payloadLength: u32,
  checksum: u32,
  magic: s32
}, { littleEndian: true });
var AdbPacket = extend(AdbPacketHeader, {
  payload: buffer("payloadLength")
});
function calculateChecksum(payload) {
  return payload.reduce((result, item) => result + item, 0);
}
var AdbPacketSerializeStream = class extends TransformStream {
  constructor() {
    const headerBuffer = new Uint8Array(AdbPacketHeader.size);
    super({
      transform: async (chunk, controller) => {
        await chunk.tryConsume(async (chunk2) => {
          const init = chunk2;
          init.payloadLength = init.payload.length;
          AdbPacketHeader.serialize(init, headerBuffer);
          await Consumable.ReadableStream.enqueue(controller, headerBuffer);
          if (init.payloadLength) {
            await Consumable.ReadableStream.enqueue(controller, init.payload);
          }
        });
      }
    });
  }
};

// node_modules/@yume-chan/adb/esm/daemon/auth.js
var AdbAuthType = {
  Token: 1,
  Signature: 2,
  PublicKey: 3
};
var AdbSignatureAuthenticator = async function* (credentialStore, getNextRequest) {
  for await (const key of credentialStore.iterateKeys()) {
    const packet = await getNextRequest();
    if (packet.arg0 !== AdbAuthType.Token) {
      return;
    }
    const signature = rsaSign(key.buffer, packet.payload);
    yield {
      command: AdbCommand.Auth,
      arg0: AdbAuthType.Signature,
      arg1: 0,
      payload: signature
    };
  }
};
var AdbPublicKeyAuthenticator = async function* (credentialStore, getNextRequest) {
  const packet = await getNextRequest();
  if (packet.arg0 !== AdbAuthType.Token) {
    return;
  }
  let privateKey;
  for await (const key of credentialStore.iterateKeys()) {
    privateKey = key;
    break;
  }
  if (!privateKey) {
    privateKey = await credentialStore.generateKey();
  }
  const publicKeyLength = adbGetPublicKeySize();
  const [publicKeyBase64Length] = calculateBase64EncodedLength(publicKeyLength);
  const nameBuffer = privateKey.name?.length ? encodeUtf8(privateKey.name) : EmptyUint8Array;
  const publicKeyBuffer = new Uint8Array(publicKeyBase64Length + (nameBuffer.length ? nameBuffer.length + 1 : 0) + // Space character + name
  1);
  adbGeneratePublicKey(privateKey.buffer, publicKeyBuffer);
  encodeBase64(publicKeyBuffer.subarray(0, publicKeyLength), publicKeyBuffer);
  if (nameBuffer.length) {
    publicKeyBuffer[publicKeyBase64Length] = 32;
    publicKeyBuffer.set(nameBuffer, publicKeyBase64Length + 1);
  }
  yield {
    command: AdbCommand.Auth,
    arg0: AdbAuthType.PublicKey,
    arg1: 0,
    payload: publicKeyBuffer
  };
};
var ADB_DEFAULT_AUTHENTICATORS = [
  AdbSignatureAuthenticator,
  AdbPublicKeyAuthenticator
];
var AdbAuthenticationProcessor = class {
  authenticators;
  #credentialStore;
  #pendingRequest = new PromiseResolver();
  #iterator;
  constructor(authenticators, credentialStore) {
    this.authenticators = authenticators;
    this.#credentialStore = credentialStore;
  }
  #getNextRequest = () => {
    return this.#pendingRequest.promise;
  };
  async *#invokeAuthenticator() {
    for (const authenticator of this.authenticators) {
      for await (const packet of authenticator(this.#credentialStore, this.#getNextRequest)) {
        this.#pendingRequest = new PromiseResolver();
        yield packet;
      }
    }
  }
  async process(packet) {
    if (!this.#iterator) {
      this.#iterator = this.#invokeAuthenticator();
    }
    this.#pendingRequest.resolve(packet);
    const result = await this.#iterator.next();
    if (result.done) {
      throw new Error("No authenticator can handle the request");
    }
    return result.value;
  }
  dispose() {
    void this.#iterator?.return?.();
  }
};

// node_modules/@yume-chan/adb/esm/daemon/socket.js
var AdbDaemonSocketController = class {
  #dispatcher;
  localId;
  remoteId;
  localCreated;
  service;
  #readable;
  #readableController;
  get readable() {
    return this.#readable;
  }
  #writableController;
  writable;
  #closed = false;
  #closedPromise = new PromiseResolver();
  get closed() {
    return this.#closedPromise.promise;
  }
  #socket;
  get socket() {
    return this.#socket;
  }
  #availableWriteBytesChanged;
  /**
   * When delayed ack is disabled, returns `Infinity` if the socket is ready to write
   * (exactly one packet can be written no matter how large it is), or `-1` if the socket
   * is waiting for ack message.
   *
   * When delayed ack is enabled, returns a non-negative finite number indicates the number of
   * bytes that can be written to the socket before waiting for ack message.
   */
  #availableWriteBytes = 0;
  constructor(options) {
    this.#dispatcher = options.dispatcher;
    this.localId = options.localId;
    this.remoteId = options.remoteId;
    this.localCreated = options.localCreated;
    this.service = options.service;
    this.#readable = new PushReadableStream((controller) => {
      this.#readableController = controller;
    });
    this.writable = new maybe_consumable_exports.WritableStream({
      start: (controller) => {
        this.#writableController = controller;
        controller.signal.addEventListener("abort", () => {
          this.#availableWriteBytesChanged?.reject(controller.signal.reason);
        });
      },
      write: async (data) => {
        const size = data.length;
        const chunkSize = this.#dispatcher.options.maxPayloadSize;
        for (let start = 0, end = chunkSize; start < size; start = end, end += chunkSize) {
          const chunk = data.subarray(start, end);
          await this.#writeChunk(chunk);
        }
      }
    });
    this.#socket = new AdbDaemonSocket(this);
    this.#availableWriteBytes = options.availableWriteBytes;
  }
  async #writeChunk(data) {
    const length = data.length;
    while (this.#availableWriteBytes < length) {
      const resolver = new PromiseResolver();
      this.#availableWriteBytesChanged = resolver;
      await resolver.promise;
    }
    if (this.#availableWriteBytes === Infinity) {
      this.#availableWriteBytes = -1;
    } else {
      this.#availableWriteBytes -= length;
    }
    await this.#dispatcher.sendPacket(AdbCommand.Write, this.localId, this.remoteId, data);
  }
  async enqueue(data) {
    await this.#readableController.enqueue(data);
  }
  ack(bytes) {
    this.#availableWriteBytes += bytes;
    this.#availableWriteBytesChanged?.resolve();
  }
  async close() {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    this.#availableWriteBytesChanged?.reject(new Error("Socket closed"));
    try {
      this.#writableController.error(new Error("Socket closed"));
    } catch {
    }
    await this.#dispatcher.sendPacket(AdbCommand.Close, this.localId, this.remoteId, EmptyUint8Array);
  }
  dispose() {
    this.#readableController.close();
    this.#closedPromise.resolve(void 0);
  }
};
var AdbDaemonSocket = class {
  #controller;
  get localId() {
    return this.#controller.localId;
  }
  get remoteId() {
    return this.#controller.remoteId;
  }
  get localCreated() {
    return this.#controller.localCreated;
  }
  get service() {
    return this.#controller.service;
  }
  get readable() {
    return this.#controller.readable;
  }
  get writable() {
    return this.#controller.writable;
  }
  get closed() {
    return this.#controller.closed;
  }
  constructor(controller) {
    this.#controller = controller;
  }
  close() {
    return this.#controller.close();
  }
};

// node_modules/@yume-chan/adb/esm/daemon/dispatcher.js
var AdbPacketDispatcher = class {
  // ADB socket id starts from 1
  // (0 means open failed)
  #initializers = new AsyncOperationManager(1);
  /**
   * Socket local ID to the socket controller.
   */
  #sockets = /* @__PURE__ */ new Map();
  #writer;
  options;
  #closed = false;
  #disconnected = new PromiseResolver();
  get disconnected() {
    return this.#disconnected.promise;
  }
  #incomingSocketHandlers = /* @__PURE__ */ new Map();
  #readAbortController = new AbortController();
  constructor(connection, options) {
    this.options = options;
    if (this.options.initialDelayedAckBytes < 0) {
      this.options.initialDelayedAckBytes = 0;
    }
    connection.readable.pipeTo(new WritableStream({
      write: async (packet, controller) => {
        switch (packet.command) {
          case AdbCommand.Close:
            await this.#handleClose(packet);
            break;
          case AdbCommand.Okay:
            this.#handleOkay(packet);
            break;
          case AdbCommand.Open:
            await this.#handleOpen(packet);
            break;
          case AdbCommand.Write:
            this.#handleWrite(packet).catch((e) => {
              controller.error(e);
            });
            break;
          default:
            throw new Error(`Unknown command: ${packet.command.toString(16)}`);
        }
      }
    }), {
      preventCancel: options.preserveConnection ?? false,
      signal: this.#readAbortController.signal
    }).then(() => {
      this.#dispose();
    }, (e) => {
      if (!this.#closed) {
        this.#disconnected.reject(e);
      }
      this.#dispose();
    });
    this.#writer = connection.writable.getWriter();
  }
  async #handleClose(packet) {
    if (packet.arg0 === 0 && this.#initializers.reject(packet.arg1, new Error("Socket open failed"))) {
      return;
    }
    const socket = this.#sockets.get(packet.arg1);
    if (socket) {
      await socket.close();
      socket.dispose();
      this.#sockets.delete(packet.arg1);
      return;
    }
  }
  #handleOkay(packet) {
    let ackBytes;
    if (this.options.initialDelayedAckBytes !== 0) {
      if (packet.payload.length !== 4) {
        throw new Error("Invalid OKAY packet. Payload size should be 4");
      }
      ackBytes = getUint32LittleEndian(packet.payload, 0);
    } else {
      if (packet.payload.length !== 0) {
        throw new Error("Invalid OKAY packet. Payload size should be 0");
      }
      ackBytes = Infinity;
    }
    if (this.#initializers.resolve(packet.arg1, {
      remoteId: packet.arg0,
      availableWriteBytes: ackBytes
    })) {
      return;
    }
    const socket = this.#sockets.get(packet.arg1);
    if (socket) {
      socket.ack(ackBytes);
      return;
    }
    void this.sendPacket(AdbCommand.Close, packet.arg1, packet.arg0, EmptyUint8Array);
  }
  #sendOkay(localId, remoteId, ackBytes) {
    let payload;
    if (this.options.initialDelayedAckBytes !== 0) {
      payload = new Uint8Array(4);
      setUint32LittleEndian(payload, 0, ackBytes);
    } else {
      payload = EmptyUint8Array;
    }
    return this.sendPacket(AdbCommand.Okay, localId, remoteId, payload);
  }
  async #handleOpen(packet) {
    const [localId] = this.#initializers.add();
    this.#initializers.resolve(localId, void 0);
    const remoteId = packet.arg0;
    let availableWriteBytes = packet.arg1;
    let service = decodeUtf8(packet.payload);
    if (service.endsWith("\0")) {
      service = service.substring(0, service.length - 1);
    }
    if (this.options.initialDelayedAckBytes === 0) {
      if (availableWriteBytes !== 0) {
        throw new Error("Invalid OPEN packet. arg1 should be 0");
      }
      availableWriteBytes = Infinity;
    } else {
      if (availableWriteBytes === 0) {
        throw new Error("Invalid OPEN packet. arg1 should be greater than 0");
      }
    }
    const handler = this.#incomingSocketHandlers.get(service);
    if (!handler) {
      await this.sendPacket(AdbCommand.Close, 0, remoteId, EmptyUint8Array);
      return;
    }
    const controller = new AdbDaemonSocketController({
      dispatcher: this,
      localId,
      remoteId,
      localCreated: false,
      service,
      availableWriteBytes
    });
    try {
      await handler(controller.socket);
      this.#sockets.set(localId, controller);
      await this.#sendOkay(localId, remoteId, this.options.initialDelayedAckBytes);
    } catch {
      await this.sendPacket(AdbCommand.Close, 0, remoteId, EmptyUint8Array);
    }
  }
  async #handleWrite(packet) {
    const socket = this.#sockets.get(packet.arg1);
    if (!socket) {
      throw new Error(`Unknown local socket id: ${packet.arg1}`);
    }
    let handled = false;
    const promises = [
      (async () => {
        await socket.enqueue(packet.payload);
        await this.#sendOkay(packet.arg1, packet.arg0, packet.payload.length);
        handled = true;
      })()
    ];
    if (this.options.readTimeLimit) {
      promises.push((async () => {
        await delay(this.options.readTimeLimit);
        if (!handled) {
          throw new Error(`readable of \`${socket.service}\` has stalled for ${this.options.readTimeLimit} milliseconds`);
        }
      })());
    }
    await Promise.race(promises);
  }
  async createSocket(service) {
    if (this.options.appendNullToServiceString) {
      service += "\0";
    }
    const [localId, initializer] = this.#initializers.add();
    await this.sendPacket(AdbCommand.Open, localId, this.options.initialDelayedAckBytes, service);
    const { remoteId, availableWriteBytes } = await initializer;
    const controller = new AdbDaemonSocketController({
      dispatcher: this,
      localId,
      remoteId,
      localCreated: true,
      service,
      availableWriteBytes
    });
    this.#sockets.set(localId, controller);
    return controller.socket;
  }
  addReverseTunnel(service, handler) {
    this.#incomingSocketHandlers.set(service, handler);
  }
  removeReverseTunnel(address) {
    this.#incomingSocketHandlers.delete(address);
  }
  clearReverseTunnels() {
    this.#incomingSocketHandlers.clear();
  }
  async sendPacket(command, arg0, arg1, payload) {
    if (typeof payload === "string") {
      payload = encodeUtf8(payload);
    }
    if (payload.length > this.options.maxPayloadSize) {
      throw new TypeError("payload too large");
    }
    await Consumable.WritableStream.write(this.#writer, {
      command,
      arg0,
      arg1,
      payload,
      checksum: this.options.calculateChecksum ? calculateChecksum(payload) : 0,
      magic: command ^ 4294967295
    });
  }
  async close() {
    await Promise.all(Array.from(this.#sockets.values(), (socket) => socket.close()));
    this.#closed = true;
    this.#readAbortController.abort();
    if (this.options.preserveConnection) {
      this.#writer.releaseLock();
    } else {
      await this.#writer.close();
    }
  }
  #dispose() {
    for (const socket of this.#sockets.values()) {
      socket.dispose();
    }
    this.#disconnected.resolve();
  }
};

// node_modules/@yume-chan/adb/esm/daemon/transport.js
var ADB_DAEMON_VERSION_OMIT_CHECKSUM = 16777217;
var ADB_DAEMON_DEFAULT_FEATURES = /* @__PURE__ */ (() => [
  AdbFeature.ShellV2,
  AdbFeature.Cmd,
  AdbFeature.StatV2,
  AdbFeature.ListV2,
  AdbFeature.FixedPushMkdir,
  "apex",
  AdbFeature.Abb,
  // only tells the client the symlink timestamp issue in `adb push --sync` has been fixed.
  // No special handling required.
  "fixed_push_symlink_timestamp",
  AdbFeature.AbbExec,
  "remount_shell",
  "track_app",
  AdbFeature.SendReceiveV2,
  "sendrecv_v2_brotli",
  "sendrecv_v2_lz4",
  "sendrecv_v2_zstd",
  "sendrecv_v2_dry_run_send",
  AdbFeature.DelayedAck
])();
var ADB_DAEMON_DEFAULT_INITIAL_PAYLOAD_SIZE = 32 * 1024 * 1024;
var AdbDaemonTransport = class _AdbDaemonTransport {
  /**
   * Authenticate with the ADB Daemon and create a new transport.
   */
  static async authenticate({ serial, connection, credentialStore, authenticators = ADB_DEFAULT_AUTHENTICATORS, features = ADB_DAEMON_DEFAULT_FEATURES, initialDelayedAckBytes = ADB_DAEMON_DEFAULT_INITIAL_PAYLOAD_SIZE, ...options }) {
    let version = 16777217;
    let maxPayloadSize = 1024 * 1024;
    const resolver = new PromiseResolver();
    const authProcessor = new AdbAuthenticationProcessor(authenticators, credentialStore);
    const abortController = new AbortController();
    const pipe = connection.readable.pipeTo(new WritableStream({
      async write(packet) {
        switch (packet.command) {
          case AdbCommand.Connect:
            version = Math.min(version, packet.arg0);
            maxPayloadSize = Math.min(maxPayloadSize, packet.arg1);
            resolver.resolve(decodeUtf8(packet.payload));
            break;
          case AdbCommand.Auth: {
            const response = await authProcessor.process(packet);
            await sendPacket(response);
            break;
          }
          default:
            break;
        }
      }
    }), {
      // Don't cancel the source ReadableStream on AbortSignal abort.
      preventCancel: true,
      signal: abortController.signal
    }).then(() => {
      resolver.reject(new Error("Connection closed unexpectedly"));
    }, (e) => {
      resolver.reject(e);
    });
    const writer = connection.writable.getWriter();
    async function sendPacket(init) {
      init.checksum = calculateChecksum(init.payload);
      init.magic = init.command ^ 4294967295;
      await Consumable.WritableStream.write(writer, init);
    }
    const actualFeatures = features.slice();
    if (initialDelayedAckBytes <= 0) {
      const index = features.indexOf(AdbFeature.DelayedAck);
      if (index !== -1) {
        actualFeatures.splice(index, 1);
      }
    }
    let banner;
    try {
      await sendPacket({
        command: AdbCommand.Connect,
        arg0: version,
        arg1: maxPayloadSize,
        // The terminating `;` is required in formal definition
        // But ADB daemon (all versions) can still work without it
        payload: encodeUtf8(`host::features=${actualFeatures.join(",")}`)
      });
      banner = await resolver.promise;
    } finally {
      abortController.abort();
      writer.releaseLock();
      await pipe;
    }
    return new _AdbDaemonTransport({
      serial,
      connection,
      version,
      maxPayloadSize,
      banner,
      features: actualFeatures,
      initialDelayedAckBytes,
      ...options
    });
  }
  #connection;
  get connection() {
    return this.#connection;
  }
  #dispatcher;
  #serial;
  get serial() {
    return this.#serial;
  }
  #protocolVersion;
  get protocolVersion() {
    return this.#protocolVersion;
  }
  get maxPayloadSize() {
    return this.#dispatcher.options.maxPayloadSize;
  }
  #banner;
  get banner() {
    return this.#banner;
  }
  get disconnected() {
    return this.#dispatcher.disconnected;
  }
  #clientFeatures;
  get clientFeatures() {
    return this.#clientFeatures;
  }
  constructor({ serial, connection, version, banner, features = ADB_DAEMON_DEFAULT_FEATURES, initialDelayedAckBytes, ...options }) {
    this.#serial = serial;
    this.#connection = connection;
    this.#banner = AdbBanner.parse(banner);
    this.#clientFeatures = features;
    if (features.includes(AdbFeature.DelayedAck)) {
      if (initialDelayedAckBytes <= 0) {
        throw new TypeError("`initialDelayedAckBytes` must be greater than 0 when DelayedAck feature is enabled.");
      }
      if (!this.#banner.features.includes(AdbFeature.DelayedAck)) {
        initialDelayedAckBytes = 0;
      }
    } else {
      initialDelayedAckBytes = 0;
    }
    let calculateChecksum2;
    let appendNullToServiceString;
    if (version >= ADB_DAEMON_VERSION_OMIT_CHECKSUM) {
      calculateChecksum2 = false;
      appendNullToServiceString = false;
    } else {
      calculateChecksum2 = true;
      appendNullToServiceString = true;
    }
    this.#dispatcher = new AdbPacketDispatcher(connection, {
      calculateChecksum: calculateChecksum2,
      appendNullToServiceString,
      initialDelayedAckBytes,
      ...options
    });
    this.#protocolVersion = version;
  }
  connect(service) {
    return this.#dispatcher.createSocket(service);
  }
  addReverseTunnel(handler, address) {
    if (!address) {
      const id = Math.random().toString().substring(2);
      address = `localabstract:reverse_${id}`;
    }
    this.#dispatcher.addReverseTunnel(address, handler);
    return address;
  }
  removeReverseTunnel(address) {
    this.#dispatcher.removeReverseTunnel(address);
  }
  clearReverseTunnels() {
    this.#dispatcher.clearReverseTunnels();
  }
  close() {
    return this.#dispatcher.close();
  }
};

// node_modules/@yume-chan/adb/esm/server/observer.js
function unorderedRemove(array, index) {
  if (index < 0 || index >= array.length) {
    return;
  }
  array[index] = array[array.length - 1];
  array.length -= 1;
}

// node_modules/@yume-chan/adb-credential-web/esm/index.js
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("Tango", 1);
    request.onerror = () => {
      reject(request.error);
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore("Authentication", { autoIncrement: true });
    };
    request.onsuccess = () => {
      const db = request.result;
      resolve(db);
    };
  });
}
async function saveKey(key) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("Authentication", "readwrite");
    const store = transaction.objectStore("Authentication");
    const putRequest = store.add(key);
    putRequest.onerror = () => {
      reject(putRequest.error);
    };
    putRequest.onsuccess = () => {
      resolve();
    };
    transaction.onerror = () => {
      reject(transaction.error);
    };
    transaction.oncomplete = () => {
      db.close();
    };
  });
}
async function getAllKeys() {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("Authentication", "readonly");
    const store = transaction.objectStore("Authentication");
    const getRequest = store.getAll();
    getRequest.onerror = () => {
      reject(getRequest.error);
    };
    getRequest.onsuccess = () => {
      resolve(getRequest.result);
    };
    transaction.onerror = () => {
      reject(transaction.error);
    };
    transaction.oncomplete = () => {
      db.close();
    };
  });
}
var AdbWebCredentialStore = class {
  #appName;
  constructor(appName = "Tango") {
    this.#appName = appName;
  }
  /**
   * Generates a RSA private key and store it into LocalStorage.
   *
   * Calling this method multiple times will overwrite the previous key.
   *
   * @returns The private key in PKCS #8 format.
   */
  async generateKey() {
    const { privateKey: cryptoKey } = await crypto.subtle.generateKey({
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      // 65537
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-1"
    }, true, ["sign", "verify"]);
    const privateKey = new Uint8Array(await crypto.subtle.exportKey("pkcs8", cryptoKey));
    await saveKey(privateKey);
    return {
      buffer: privateKey,
      name: `${this.#appName}@${globalThis.location.hostname}`
    };
  }
  /**
   * Yields the stored RSA private key.
   *
   * This method returns a generator, so `for await...of...` loop should be used to read the key.
   */
  async *iterateKeys() {
    for (const key of await getAllKeys()) {
      yield {
        buffer: key,
        name: `${this.#appName}@${globalThis.location.hostname}`
      };
    }
  }
};

// node_modules/@yume-chan/adb-daemon-webusb/esm/error.js
var DeviceBusyError = class extends Error {
  constructor(cause) {
    super("The device is already in used by another program", {
      cause
    });
  }
};

// node_modules/@yume-chan/adb-daemon-webusb/esm/utils.js
function isErrorName(e, name) {
  return typeof e === "object" && e !== null && "name" in e && e.name === name;
}
function isUsbInterfaceFilter(filter) {
  return filter.classCode !== void 0 && filter.subclassCode !== void 0 && filter.protocolCode !== void 0;
}
function matchUsbInterfaceFilter(alternate, filter) {
  return alternate.interfaceClass === filter.classCode && alternate.interfaceSubclass === filter.subclassCode && alternate.interfaceProtocol === filter.protocolCode;
}
function findUsbInterface(device, filter) {
  for (const configuration of device.configurations) {
    for (const interface_ of configuration.interfaces) {
      for (const alternate of interface_.alternates) {
        if (matchUsbInterfaceFilter(alternate, filter)) {
          return { configuration, interface_, alternate };
        }
      }
    }
  }
  return void 0;
}
function padNumber(value) {
  return value.toString(16).padStart(4, "0");
}
function getSerialNumber(device) {
  if (device.serialNumber) {
    return device.serialNumber;
  }
  return padNumber(device.vendorId) + "x" + padNumber(device.productId);
}
function findUsbEndpoints(endpoints) {
  if (endpoints.length === 0) {
    throw new TypeError("No endpoints given");
  }
  let inEndpoint;
  let outEndpoint;
  for (const endpoint of endpoints) {
    switch (endpoint.direction) {
      case "in":
        inEndpoint = endpoint;
        if (outEndpoint) {
          return { inEndpoint, outEndpoint };
        }
        break;
      case "out":
        outEndpoint = endpoint;
        if (inEndpoint) {
          return { inEndpoint, outEndpoint };
        }
        break;
    }
  }
  if (!inEndpoint) {
    throw new TypeError("No input endpoint found.");
  }
  if (!outEndpoint) {
    throw new TypeError("No output endpoint found.");
  }
  throw new Error("unreachable");
}
function matchFilter(device, filter) {
  if (filter.vendorId !== void 0 && device.vendorId !== filter.vendorId) {
    return false;
  }
  if (filter.productId !== void 0 && device.productId !== filter.productId) {
    return false;
  }
  if (filter.serialNumber !== void 0 && getSerialNumber(device) !== filter.serialNumber) {
    return false;
  }
  if (isUsbInterfaceFilter(filter)) {
    return findUsbInterface(device, filter) || false;
  }
  return true;
}
function matchFilters(device, filters, exclusionFilters) {
  if (exclusionFilters && exclusionFilters.length > 0) {
    if (matchFilters(device, exclusionFilters)) {
      return false;
    }
  }
  for (const filter of filters) {
    const result = matchFilter(device, filter);
    if (result) {
      return result;
    }
  }
  return false;
}

// node_modules/@yume-chan/adb-daemon-webusb/esm/device.js
var AdbDefaultInterfaceFilter = {
  classCode: 255,
  subclassCode: 66,
  protocolCode: 1
};
function mergeDefaultAdbInterfaceFilter(filters) {
  if (!filters || filters.length === 0) {
    return [AdbDefaultInterfaceFilter];
  } else {
    return filters.map((filter) => ({
      ...filter,
      classCode: filter.classCode ?? AdbDefaultInterfaceFilter.classCode,
      subclassCode: filter.subclassCode ?? AdbDefaultInterfaceFilter.subclassCode,
      protocolCode: filter.protocolCode ?? AdbDefaultInterfaceFilter.protocolCode
    }));
  }
}
var AdbDaemonWebUsbConnection = class {
  #device;
  get device() {
    return this.#device;
  }
  #inEndpoint;
  get inEndpoint() {
    return this.#inEndpoint;
  }
  #outEndpoint;
  get outEndpoint() {
    return this.#outEndpoint;
  }
  #readable;
  get readable() {
    return this.#readable;
  }
  #writable;
  get writable() {
    return this.#writable;
  }
  constructor(device, inEndpoint, outEndpoint, usbManager) {
    this.#device = device;
    this.#inEndpoint = inEndpoint;
    this.#outEndpoint = outEndpoint;
    let closed2 = false;
    const duplex = new DuplexStreamFactory({
      close: async () => {
        try {
          closed2 = true;
          await device.raw.close();
        } catch {
        }
      },
      dispose: () => {
        closed2 = true;
        usbManager.removeEventListener("disconnect", handleUsbDisconnect);
      }
    });
    function handleUsbDisconnect(e) {
      if (e.device === device.raw) {
        duplex.dispose().catch(unreachable);
      }
    }
    usbManager.addEventListener("disconnect", handleUsbDisconnect);
    this.#readable = duplex.wrapReadable(new ReadableStream2({
      pull: async (controller) => {
        const packet = await this.#transferIn();
        if (packet) {
          controller.enqueue(packet);
        } else {
          controller.close();
        }
      }
    }, { highWaterMark: 0 }));
    const zeroMask = outEndpoint.packetSize - 1;
    this.#writable = pipeFrom(duplex.createWritable(new maybe_consumable_exports.WritableStream({
      write: async (chunk) => {
        try {
          await device.raw.transferOut(outEndpoint.endpointNumber, toLocalUint8Array(chunk));
          if (zeroMask && (chunk.length & zeroMask) === 0) {
            await device.raw.transferOut(outEndpoint.endpointNumber, EmptyUint8Array);
          }
        } catch (e) {
          if (closed2) {
            return;
          }
          throw e;
        }
      }
    })), new AdbPacketSerializeStream());
  }
  async #transferIn() {
    try {
      while (true) {
        const result = await this.#device.raw.transferIn(this.#inEndpoint.endpointNumber, this.#inEndpoint.packetSize);
        if (result.data.byteLength !== 24) {
          continue;
        }
        const buffer2 = new Uint8Array(result.data.buffer);
        const stream = new Uint8ArrayExactReadable(buffer2);
        const packet = AdbPacketHeader.deserialize(stream);
        if (packet.magic !== (packet.command ^ 4294967295)) {
          continue;
        }
        if (packet.payloadLength !== 0) {
          const result2 = await this.#device.raw.transferIn(this.#inEndpoint.endpointNumber, packet.payloadLength);
          packet.payload = new Uint8Array(result2.data.buffer);
        } else {
          packet.payload = EmptyUint8Array;
        }
        return packet;
      }
    } catch (e) {
      if (isErrorName(e, "NetworkError")) {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 100);
        });
        if (closed) {
          return void 0;
        }
      }
      throw e;
    }
  }
};
var AdbDaemonWebUsbDevice = class _AdbDaemonWebUsbDevice {
  static DeviceBusyError = DeviceBusyError;
  #interface;
  #usbManager;
  #raw;
  get raw() {
    return this.#raw;
  }
  #serial;
  get serial() {
    return this.#serial;
  }
  get name() {
    return this.#raw.productName;
  }
  /**
   * Create a new instance of `AdbDaemonWebUsbConnection` using a specified `USBDevice` instance
   *
   * @param device The `USBDevice` instance obtained elsewhere.
   * @param filters The filters to use when searching for ADB interface. Defaults to {@link ADB_DEFAULT_DEVICE_FILTER}.
   */
  constructor(device, interface_, usbManager) {
    this.#raw = device;
    this.#serial = getSerialNumber(device);
    this.#interface = interface_;
    this.#usbManager = usbManager;
  }
  async #claimInterface() {
    if (!this.#raw.opened) {
      await this.#raw.open();
    }
    const { configuration, interface_, alternate } = this.#interface;
    if (this.#raw.configuration?.configurationValue !== configuration.configurationValue) {
      await this.#raw.selectConfiguration(configuration.configurationValue);
    }
    if (!interface_.claimed) {
      try {
        await this.#raw.claimInterface(interface_.interfaceNumber);
      } catch (e) {
        if (isErrorName(e, "NetworkError")) {
          throw new _AdbDaemonWebUsbDevice.DeviceBusyError(e);
        }
        throw e;
      }
    }
    if (interface_.alternate.alternateSetting !== alternate.alternateSetting) {
      await this.#raw.selectAlternateInterface(interface_.interfaceNumber, alternate.alternateSetting);
    }
    return findUsbEndpoints(alternate.endpoints);
  }
  /**
   * Open the device and create a new connection to the ADB Daemon.
   */
  async connect() {
    const { inEndpoint, outEndpoint } = await this.#claimInterface();
    return new AdbDaemonWebUsbConnection(this, inEndpoint, outEndpoint, this.#usbManager);
  }
};

// node_modules/@yume-chan/adb-daemon-webusb/esm/observer.js
var AdbDaemonWebUsbDeviceObserver = class _AdbDaemonWebUsbDeviceObserver {
  static async create(usb, options = {}) {
    const devices = await usb.getDevices();
    return new _AdbDaemonWebUsbDeviceObserver(usb, devices, options);
  }
  #filters;
  #exclusionFilters;
  #usbManager;
  #onDeviceAdd = new EventEmitter();
  onDeviceAdd = this.#onDeviceAdd.event;
  #onDeviceRemove = new EventEmitter();
  onDeviceRemove = this.#onDeviceRemove.event;
  #onListChange = new StickyEventEmitter();
  onListChange = this.#onListChange.event;
  current = [];
  constructor(usb, initial, options = {}) {
    this.#filters = mergeDefaultAdbInterfaceFilter(options.filters);
    this.#exclusionFilters = options.exclusionFilters;
    this.#usbManager = usb;
    this.current = initial.map((device) => this.#convertDevice(device)).filter((device) => !!device);
    this.#onListChange.fire(this.current);
    this.#usbManager.addEventListener("connect", this.#handleConnect);
    this.#usbManager.addEventListener("disconnect", this.#handleDisconnect);
  }
  #convertDevice(device) {
    const interface_ = matchFilters(device, this.#filters, this.#exclusionFilters);
    if (!interface_) {
      return void 0;
    }
    return new AdbDaemonWebUsbDevice(device, interface_, this.#usbManager);
  }
  #handleConnect = (e) => {
    const device = this.#convertDevice(e.device);
    if (!device) {
      return;
    }
    if (this.current.some((item) => item.raw === device.raw)) {
      return;
    }
    const next = this.current.slice();
    next.push(device);
    this.current = next;
    this.#onDeviceAdd.fire([device]);
    this.#onListChange.fire(this.current);
  };
  #handleDisconnect = (e) => {
    const index = this.current.findIndex((device) => device.raw === e.device);
    if (index !== -1) {
      const device = this.current[index];
      const next = this.current.slice();
      unorderedRemove(next, index);
      this.current = next;
      this.#onDeviceRemove.fire([device]);
      this.#onListChange.fire(this.current);
    }
  };
  stop() {
    this.#usbManager.removeEventListener("connect", this.#handleConnect);
    this.#usbManager.removeEventListener("disconnect", this.#handleDisconnect);
    this.#onDeviceAdd.dispose();
    this.#onDeviceRemove.dispose();
    this.#onListChange.dispose();
  }
};

// node_modules/@yume-chan/adb-daemon-webusb/esm/manager.js
var AdbDaemonWebUsbDeviceManager = class _AdbDaemonWebUsbDeviceManager {
  /**
   * Gets the instance of {@link AdbDaemonWebUsbDeviceManager} using browser WebUSB implementation.
   *
   * May be `undefined` if current runtime does not support WebUSB.
   */
  static BROWSER = /* @__PURE__ */ (() => typeof globalThis.navigator !== "undefined" && globalThis.navigator.usb ? new _AdbDaemonWebUsbDeviceManager(globalThis.navigator.usb) : void 0)();
  #usbManager;
  /**
   * Create a new instance of {@link AdbDaemonWebUsbDeviceManager} using the specified WebUSB implementation.
   * @param usbManager A WebUSB compatible interface.
   */
  constructor(usbManager) {
    this.#usbManager = usbManager;
  }
  /**
   * Call `USB#requestDevice()` to prompt the user to select a device.
   */
  async requestDevice(options = {}) {
    const filters = mergeDefaultAdbInterfaceFilter(options.filters);
    try {
      const device = await this.#usbManager.requestDevice({
        filters,
        exclusionFilters: options.exclusionFilters
      });
      const interface_ = matchFilters(device, filters, options.exclusionFilters);
      if (!interface_) {
        return void 0;
      }
      this.#usbManager.dispatchEvent(new USBConnectionEvent("connect", { device }));
      return new AdbDaemonWebUsbDevice(device, interface_, this.#usbManager);
    } catch (e) {
      if (isErrorName(e, "NotFoundError")) {
        return void 0;
      }
      throw e;
    }
  }
  /**
   * Get all connected and requested devices that match the specified filters.
   */
  async getDevices(options = {}) {
    const filters = mergeDefaultAdbInterfaceFilter(options.filters);
    const devices = await this.#usbManager.getDevices();
    const result = [];
    for (const device of devices) {
      const interface_ = matchFilters(device, filters, options.exclusionFilters);
      if (interface_) {
        result.push(new AdbDaemonWebUsbDevice(device, interface_, this.#usbManager));
      }
    }
    return result;
  }
  trackDevices(options = {}) {
    return AdbDaemonWebUsbDeviceObserver.create(this.#usbManager, options);
  }
};

// node_modules/@yume-chan/scrcpy/esm/base/audio.js
var ScrcpyAudioCodec = class _ScrcpyAudioCodec {
  static Opus = /* @__PURE__ */ new _ScrcpyAudioCodec("opus", 1869641075, "audio/opus", "opus");
  static Aac = /* @__PURE__ */ new _ScrcpyAudioCodec("aac", 6381923, "audio/aac", "mp4a.66");
  static Flac = /* @__PURE__ */ new _ScrcpyAudioCodec("flac", 1718378851, "audio/flac", "flac");
  static Raw = /* @__PURE__ */ new _ScrcpyAudioCodec("raw", 7496055, "audio/raw", "");
  optionValue;
  metadataValue;
  mimeType;
  webCodecId;
  constructor(optionValue, metadataValue, mimeType, webCodecId) {
    this.optionValue = optionValue;
    this.metadataValue = metadataValue;
    this.mimeType = mimeType;
    this.webCodecId = webCodecId;
  }
  toOptionValue() {
    return this.optionValue;
  }
};

// node_modules/@yume-chan/scrcpy/esm/base/control-message-type.js
var ScrcpyControlMessageType = {
  InjectKeyCode: 0,
  InjectText: 1,
  InjectTouch: 2,
  InjectScroll: 3,
  BackOrScreenOn: 4,
  ExpandNotificationPanel: 5,
  ExpandSettingPanel: 6,
  CollapseNotificationPanel: 7,
  GetClipboard: 8,
  SetClipboard: 9,
  SetDisplayPower: 10,
  RotateDevice: 11,
  UHidCreate: 12,
  UHidInput: 13,
  UHidDestroy: 14,
  OpenHardKeyboardSettings: 15,
  StartApp: 16,
  ResetVideo: 17
};

// node_modules/@yume-chan/scrcpy/esm/base/device-message.js
var ScrcpyDeviceMessageParsers = class {
  #parsers = [];
  get parsers() {
    return this.#parsers;
  }
  #add(id, parser) {
    if (this.#parsers[id]) {
      throw new Error(`Duplicate parser for id ${id}`);
    }
    this.#parsers[id] = parser;
  }
  add(parser) {
    if (Array.isArray(parser.id)) {
      for (const id of parser.id) {
        this.#add(id, parser);
      }
    } else {
      this.#add(parser.id, parser);
    }
    return parser;
  }
  async parse(id, stream) {
    const parser = this.#parsers[id];
    if (!parser) {
      throw new Error(`Unknown device message id ${id}`);
    }
    return parser.parse(id, stream);
  }
  close() {
    for (const parser of this.#parsers) {
      parser.close();
    }
  }
  error(e) {
    for (const parser of this.#parsers) {
      parser.error(e);
    }
  }
};

// node_modules/@yume-chan/scrcpy/esm/base/option-value.js
function isScrcpyOptionValue(value) {
  return typeof value === "object" && value !== null && "toOptionValue" in value && typeof value.toOptionValue === "function";
}
function toScrcpyOptionValue(value, empty) {
  if (isScrcpyOptionValue(value)) {
    value = value.toOptionValue();
  }
  if (value === void 0) {
    return empty;
  }
  if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
    throw new TypeError(`Invalid option value: ${JSON.stringify(value)}`);
  }
  return value.toString();
}

// node_modules/@yume-chan/scrcpy/esm/base/video.js
var ScrcpyVideoCodecId = {
  H264: 1748121140,
  H265: 1748121141,
  AV1: 6387249
};

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/index.js
var impl_exports = {};
__export(impl_exports, {
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes,
  Crop: () => Crop,
  Defaults: () => Defaults,
  InjectScrollControlMessage: () => InjectScrollControlMessage,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  ScrollController: () => ScrollController,
  SerializeOrder: () => SerializeOrder,
  SetClipboardControlMessage: () => SetClipboardControlMessage,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation,
  createMediaStreamTransformer: () => createMediaStreamTransformer,
  createScrollController: () => createScrollController,
  parseDisplay: () => parseDisplay,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays
});

// node_modules/@yume-chan/scrcpy/esm/android/key-event.js
var AndroidKeyEventAction = {
  Down: 0,
  Up: 1
};
var AndroidKeyEventMeta = {
  None: 0,
  Alt: 2,
  AltLeft: 16,
  AltRight: 32,
  Shift: 1,
  ShiftLeft: 64,
  ShiftRight: 128,
  Ctrl: 4096,
  CtrlLeft: 8192,
  CtrlRight: 16384,
  Meta: 65536,
  MetaLeft: 131072,
  MetaRight: 262144,
  CapsLock: 1048576,
  NumLock: 2097152,
  ScrollLock: 4194304
};

// node_modules/@yume-chan/scrcpy/esm/android/motion-event.js
var AndroidMotionEventAction = {
  Down: 0,
  Up: 1,
  Move: 2,
  Cancel: 3,
  Outside: 4,
  PointerDown: 5,
  PointerUp: 6,
  HoverMove: 7,
  Scroll: 8,
  HoverEnter: 9,
  HoverExit: 10,
  ButtonPress: 11,
  ButtonRelease: 12
};
var AndroidMotionEventButton = {
  None: 0,
  Primary: 1,
  Secondary: 2,
  Tertiary: 4,
  Back: 8,
  Forward: 16,
  StylusPrimary: 32,
  StylusSecondary: 64
};

// node_modules/@yume-chan/scrcpy/esm/control/empty.js
var EmptyControlMessage = struct({ type: u8 }, { littleEndian: false });

// node_modules/@yume-chan/scrcpy/esm/control/inject-key-code.js
var ScrcpyInjectKeyCodeControlMessage = /* @__PURE__ */ (() => struct({
  type: u8(ScrcpyControlMessageType.InjectKeyCode),
  action: u8(),
  keyCode: u32(),
  repeat: u32,
  metaState: u32()
}, { littleEndian: false }))();

// node_modules/@yume-chan/scrcpy/esm/control/inject-text.js
var ScrcpyInjectTextControlMessage = struct({ type: u8, text: string(u32) }, { littleEndian: false });

// node_modules/@yume-chan/scrcpy/esm/control/message-type-map.js
var ScrcpyControlMessageTypeMap = class {
  #types;
  constructor(options) {
    this.#types = options.controlMessageTypes;
  }
  get(type) {
    const value = this.#types.indexOf(type);
    if (value === -1) {
      throw new TypeError("Invalid or unsupported control message type");
    }
    return value;
  }
  fillMessageType(message, type) {
    message.type = this.get(type);
    return message;
  }
};

// node_modules/@yume-chan/scrcpy/esm/control/set-screen-power-mode.js
var ScrcpySetDisplayPowerControlMessage = struct({ type: u8, mode: u8() }, { littleEndian: false });

// node_modules/@yume-chan/scrcpy/esm/control/start-app.js
var ScrcpyStartAppControlMessage = struct({
  type: u8,
  name: string(u8)
}, { littleEndian: false });

// node_modules/@yume-chan/scrcpy/esm/control/uhid.js
var ScrcpyUHidInputControlMessage = /* @__PURE__ */ (() => struct({
  type: u8(ScrcpyControlMessageType.UHidInput),
  id: u16,
  data: buffer(u16)
}, { littleEndian: false }))();
var ScrcpyUHidDestroyControlMessage = struct({ type: u8, id: u16 }, { littleEndian: false });

// node_modules/@yume-chan/scrcpy/esm/control/serializer.js
var ScrcpyControlMessageSerializer = class {
  #options;
  #typeMap;
  #scrollController;
  constructor(options) {
    this.#options = options;
    this.#typeMap = new ScrcpyControlMessageTypeMap(options);
    this.#scrollController = options.createScrollController();
  }
  injectKeyCode(message) {
    return ScrcpyInjectKeyCodeControlMessage.serialize(this.#typeMap.fillMessageType(message, ScrcpyControlMessageType.InjectKeyCode));
  }
  injectText(text) {
    return ScrcpyInjectTextControlMessage.serialize({
      text,
      type: this.#typeMap.get(ScrcpyControlMessageType.InjectText)
    });
  }
  /**
   * `pressure` is a float value between 0 and 1.
   */
  injectTouch(message) {
    return this.#options.serializeInjectTouchControlMessage(this.#typeMap.fillMessageType(message, ScrcpyControlMessageType.InjectTouch));
  }
  /**
   * `scrollX` and `scrollY` are float values between 0 and 1.
   */
  injectScroll(message) {
    return this.#scrollController.serializeScrollMessage(this.#typeMap.fillMessageType(message, ScrcpyControlMessageType.InjectScroll));
  }
  backOrScreenOn(action) {
    return this.#options.serializeBackOrScreenOnControlMessage({
      action,
      type: this.#typeMap.get(ScrcpyControlMessageType.BackOrScreenOn)
    });
  }
  setDisplayPower(mode) {
    return ScrcpySetDisplayPowerControlMessage.serialize({
      mode,
      type: this.#typeMap.get(ScrcpyControlMessageType.SetDisplayPower)
    });
  }
  expandNotificationPanel() {
    return EmptyControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.ExpandNotificationPanel)
    });
  }
  expandSettingPanel() {
    return EmptyControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.ExpandSettingPanel)
    });
  }
  collapseNotificationPanel() {
    return EmptyControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.CollapseNotificationPanel)
    });
  }
  rotateDevice() {
    return EmptyControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.RotateDevice)
    });
  }
  setClipboard(message) {
    return this.#options.serializeSetClipboardControlMessage({
      ...message,
      type: this.#typeMap.get(ScrcpyControlMessageType.SetClipboard)
    });
  }
  uHidCreate(message) {
    if (!this.#options.serializeUHidCreateControlMessage) {
      throw new Error("UHid not supported");
    }
    return this.#options.serializeUHidCreateControlMessage(this.#typeMap.fillMessageType(message, ScrcpyControlMessageType.UHidCreate));
  }
  uHidInput(message) {
    return ScrcpyUHidInputControlMessage.serialize(this.#typeMap.fillMessageType(message, ScrcpyControlMessageType.UHidInput));
  }
  uHidDestroy(id) {
    return ScrcpyUHidDestroyControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.UHidDestroy),
      id
    });
  }
  startApp(name, options) {
    if (options?.searchByName) {
      name = "?" + name;
    }
    if (options?.forceStop) {
      name = "+" + name;
    }
    return ScrcpyStartAppControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.StartApp),
      name
    });
  }
  resetVideo() {
    return EmptyControlMessage.serialize({
      type: this.#typeMap.get(ScrcpyControlMessageType.ResetVideo)
    });
  }
};

// node_modules/@yume-chan/scrcpy/esm/control/writer.js
var ScrcpyControlMessageWriter = class {
  #writer;
  #serializer;
  constructor(writer, options) {
    this.#writer = writer;
    this.#serializer = new ScrcpyControlMessageSerializer(options);
  }
  write(message) {
    return Consumable.WritableStream.write(this.#writer, message);
  }
  injectKeyCode(message) {
    return this.write(this.#serializer.injectKeyCode(message));
  }
  injectText(text) {
    return this.write(this.#serializer.injectText(text));
  }
  /**
   * `pressure` is a float value between 0 and 1.
   */
  injectTouch(message) {
    return this.write(this.#serializer.injectTouch(message));
  }
  /**
   * `scrollX` and `scrollY` are float values between 0 and 1.
   */
  async injectScroll(message) {
    const data = this.#serializer.injectScroll(message);
    if (data) {
      await this.write(data);
    }
  }
  async backOrScreenOn(action) {
    const data = this.#serializer.backOrScreenOn(action);
    if (data) {
      await this.write(data);
    }
  }
  setScreenPowerMode(mode) {
    return this.write(this.#serializer.setDisplayPower(mode));
  }
  expandNotificationPanel() {
    return this.write(this.#serializer.expandNotificationPanel());
  }
  expandSettingPanel() {
    return this.write(this.#serializer.expandSettingPanel());
  }
  collapseNotificationPanel() {
    return this.write(this.#serializer.collapseNotificationPanel());
  }
  rotateDevice() {
    return this.write(this.#serializer.rotateDevice());
  }
  async setClipboard(message) {
    const result = this.#serializer.setClipboard(message);
    if (result instanceof Uint8Array) {
      await this.write(result);
    } else {
      await this.write(result[0]);
      await result[1];
    }
  }
  uHidCreate(message) {
    return this.write(this.#serializer.uHidCreate(message));
  }
  uHidInput(message) {
    return this.write(this.#serializer.uHidInput(message));
  }
  uHidDestroy(id) {
    return this.write(this.#serializer.uHidDestroy(id));
  }
  startApp(name, options) {
    return this.write(this.#serializer.startApp(name, options));
  }
  resetVideo() {
    return this.write(this.#serializer.resetVideo());
  }
  releaseLock() {
    this.#writer.releaseLock();
  }
  async close() {
    await this.#writer.close();
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/back-or-screen-on.js
var BackOrScreenOnControlMessage = EmptyControlMessage;
function serializeBackOrScreenOnControlMessage(message) {
  if (message.action === AndroidKeyEventAction.Down) {
    return BackOrScreenOnControlMessage.serialize(message);
  }
  return void 0;
}

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/clipboard-stream.js
var ClipboardDeviceMessage = struct({ content: string(u32) }, { littleEndian: false });
var ClipboardStream = class extends PushReadableStream {
  #controller;
  id = 0;
  constructor() {
    let controller;
    super((controller_) => {
      controller = controller_;
    });
    this.#controller = controller;
  }
  async parse(_id, stream) {
    const message = await ClipboardDeviceMessage.deserialize(stream);
    await this.#controller.enqueue(message.content);
  }
  close() {
    this.#controller.close();
  }
  error(e) {
    this.#controller.error(e);
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/control-message-types.js
var ControlMessageTypes = /* @__PURE__ */ (() => [
  /*  0 */
  ScrcpyControlMessageType.InjectKeyCode,
  /*  1 */
  ScrcpyControlMessageType.InjectText,
  /*  2 */
  ScrcpyControlMessageType.InjectTouch,
  /*  3 */
  ScrcpyControlMessageType.InjectScroll,
  /*  4 */
  ScrcpyControlMessageType.BackOrScreenOn,
  /*  5 */
  ScrcpyControlMessageType.ExpandNotificationPanel,
  /*  6 */
  ScrcpyControlMessageType.CollapseNotificationPanel,
  /*  7 */
  ScrcpyControlMessageType.GetClipboard,
  /*  8 */
  ScrcpyControlMessageType.SetClipboard,
  /*  9 */
  ScrcpyControlMessageType.SetDisplayPower,
  /* 10 */
  ScrcpyControlMessageType.RotateDevice
])();

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/init.js
var VideoOrientation = {
  Unlocked: -1,
  Portrait: 0,
  Landscape: 1,
  PortraitFlipped: 2,
  LandscapeFlipped: 3
};
function toDashCase(input) {
  return input.replace(/([A-Z])/g, "-$1").toLowerCase();
}
var CodecOptionTypes = {
  repeatPreviousFrameAfter: "long",
  maxPtsGapToEncoder: "long"
};
var CodecOptions = class _CodecOptions {
  static Empty = /* @__PURE__ */ new _CodecOptions();
  options;
  constructor(options = {}) {
    for (const [key, value] of Object.entries(options)) {
      if (value === void 0) {
        continue;
      }
      if (typeof value !== "number") {
        throw new Error(`Invalid option value for ${key}: ${String(value)}`);
      }
    }
    this.options = options;
  }
  toOptionValue() {
    const entries = Object.entries(this.options).filter(([, value]) => value !== void 0);
    if (entries.length === 0) {
      return void 0;
    }
    return entries.map(([key, value]) => {
      let result = toDashCase(key);
      const type = CodecOptionTypes[key];
      if (type) {
        result += `:${type}`;
      }
      result += `=${value}`;
      return result;
    }).join(",");
  }
};
var Crop = class {
  width;
  height;
  x;
  y;
  constructor(width, height, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
  }
  toOptionValue() {
    return `${this.width}:${this.height}:${this.x}:${this.y}`;
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/defaults.js
var Defaults = {
  logLevel: "debug",
  maxSize: 0,
  bitRate: 8e6,
  maxFps: 0,
  lockVideoOrientation: VideoOrientation.Unlocked,
  tunnelForward: false,
  crop: void 0,
  sendFrameMeta: true,
  control: true,
  displayId: 0,
  showTouches: false,
  stayAwake: false,
  codecOptions: void 0
};

// node_modules/@yume-chan/scrcpy/esm/utils/clamp.js
function clamp(value, min, max) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

// node_modules/@yume-chan/scrcpy/esm/utils/constants.js
var DefaultServerPath = "/data/local/tmp/scrcpy-server.jar";

// node_modules/@yume-chan/scrcpy/esm/utils/omit.js
// @__NO_SIDE_EFFECTS__
function omit(value, ...keys) {
  return Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
}

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/inject-touch.js
var UnsignedFloat = field(2, "byob", (source, { buffer: buffer2, index, littleEndian }) => {
  source = clamp(source, -1, 1);
  source = source === 1 ? 65535 : source * 65536;
  setUint16(buffer2, index, source, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(2));
  const value = getUint16(data, 0, littleEndian);
  return value === 65535 ? 1 : value / 65536;
});
var PointerId = {
  Mouse: -1n,
  Finger: -2n,
  VirtualMouse: -3n,
  VirtualFinger: -4n
};
var InjectTouchControlMessage = struct({
  type: u8,
  action: u8(),
  pointerId: u64,
  pointerX: u32,
  pointerY: u32,
  videoWidth: u16,
  videoHeight: u16,
  pressure: UnsignedFloat,
  buttons: u32
}, { littleEndian: false });
function serializeInjectTouchControlMessage(message) {
  return InjectTouchControlMessage.serialize(message);
}

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/media-stream-transformer.js
var MediaStreamRawPacket = struct({ pts: u64, data: buffer(u32) }, { littleEndian: false });
var PtsConfig = 1n << 63n;
function createMediaStreamTransformer(options) {
  if (!options.sendFrameMeta) {
    return new TransformStream({
      transform(chunk, controller) {
        controller.enqueue({
          type: "data",
          data: chunk
        });
      }
    });
  }
  const deserializeStream = new StructDeserializeStream(MediaStreamRawPacket);
  return {
    writable: deserializeStream.writable,
    readable: deserializeStream.readable.pipeThrough(new TransformStream({
      transform(packet, controller) {
        if (packet.pts === PtsConfig) {
          controller.enqueue({
            type: "configuration",
            data: packet.data
          });
          return;
        }
        controller.enqueue({
          type: "data",
          pts: packet.pts,
          data: packet.data
        });
      }
    }))
  };
}

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/parse-display.js
function parseDisplay(line) {
  const match = line.match(/^\s+scrcpy --display (\d+)$/);
  if (match) {
    return {
      id: Number.parseInt(match[1], 10)
    };
  }
  return void 0;
}

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/parse-video-stream-metadata.js
async function readString(stream, maxLength) {
  const buffer2 = await stream.readExactly(maxLength);
  return decodeUtf8(buffer2.subarray(0, buffer2.indexOf(0)));
}
async function readU16(stream) {
  const buffer2 = await stream.readExactly(2);
  return getUint16BigEndian(buffer2, 0);
}
async function readU32(stream) {
  const buffer2 = await stream.readExactly(4);
  return getUint32BigEndian(buffer2, 0);
}
async function parseVideoStreamMetadata(stream) {
  const buffered = new BufferedReadableStream(stream);
  const metadata = {
    codec: ScrcpyVideoCodecId.H264
  };
  metadata.deviceName = await readString(buffered, 64);
  metadata.width = await readU16(buffered);
  metadata.height = await readU16(buffered);
  return { stream: buffered.release(), metadata };
}

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/scroll-controller.js
var InjectScrollControlMessage = struct({
  type: u8,
  pointerX: u32,
  pointerY: u32,
  videoWidth: u16,
  videoHeight: u16,
  scrollX: s32,
  scrollY: s32
}, { littleEndian: false });
var ScrollController = class {
  #accumulatedX = 0;
  #accumulatedY = 0;
  processMessage(message) {
    if (message.scrollX) {
      if (Math.sign(message.scrollX) !== Math.sign(this.#accumulatedX)) {
        this.#accumulatedX = message.scrollX;
      } else {
        this.#accumulatedX += message.scrollX;
      }
    }
    if (message.scrollY) {
      if (Math.sign(message.scrollY) !== Math.sign(this.#accumulatedY)) {
        this.#accumulatedY = message.scrollY;
      } else {
        this.#accumulatedY += message.scrollY;
      }
    }
    const integerX = this.#accumulatedX | 0;
    this.#accumulatedX -= integerX;
    const integerY = this.#accumulatedY | 0;
    this.#accumulatedY -= integerY;
    if (integerX === 0 && integerY === 0) {
      return void 0;
    }
    message.scrollX = integerX;
    message.scrollY = integerY;
    return message;
  }
  serializeScrollMessage(message) {
    const processed = this.processMessage(message);
    if (!processed) {
      return void 0;
    }
    return InjectScrollControlMessage.serialize(processed);
  }
};
function createScrollController() {
  return new ScrollController();
}

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/serialize-order.js
var SerializeOrder = [
  "logLevel",
  "maxSize",
  "bitRate",
  "maxFps",
  "lockVideoOrientation",
  "tunnelForward",
  "crop",
  "sendFrameMeta",
  "control",
  "displayId",
  "showTouches",
  "stayAwake",
  "codecOptions"
];

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/serialize.js
function serialize(options, order) {
  return order.map((key) => toScrcpyOptionValue(options[key], "-"));
}

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/set-clipboard.js
var SetClipboardControlMessage = struct({ type: u8, content: string(u32) }, { littleEndian: false });
function serializeSetClipboardControlMessage(message) {
  return SetClipboardControlMessage.serialize(message);
}

// node_modules/@yume-chan/scrcpy/esm/1_15/impl/set-list-display.js
function setListDisplays(options) {
  options.displayId = -1;
}

// node_modules/@yume-chan/scrcpy/esm/1_17/impl/index.js
var impl_exports2 = {};
__export(impl_exports2, {
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes,
  Crop: () => Crop,
  Defaults: () => Defaults2,
  EncoderRegex: () => EncoderRegex,
  InjectScrollControlMessage: () => InjectScrollControlMessage,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  ScrollController: () => ScrollController,
  SerializeOrder: () => SerializeOrder2,
  SetClipboardControlMessage: () => SetClipboardControlMessage,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation,
  createMediaStreamTransformer: () => createMediaStreamTransformer,
  createScrollController: () => createScrollController,
  parseDisplay: () => parseDisplay,
  parseEncoder: () => parseEncoder,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays,
  setListEncoders: () => setListEncoders
});

// node_modules/@yume-chan/scrcpy/esm/1_17/impl/defaults.js
var Defaults2 = /* @__PURE__ */ (() => ({
  ...impl_exports.Defaults,
  encoderName: void 0
}))();

// node_modules/@yume-chan/scrcpy/esm/1_17/impl/parse-encoder.js
function parseEncoder(line, encoderNameRegex) {
  const match = line.match(encoderNameRegex);
  if (match) {
    return { type: "video", name: match[1] };
  }
  return void 0;
}
var EncoderRegex = /^\s+scrcpy --encoder-name '([^']+)'$/;

// node_modules/@yume-chan/scrcpy/esm/1_17/impl/serialize-order.js
var SerializeOrder2 = /* @__PURE__ */ (() => [
  ...impl_exports.SerializeOrder,
  "encoderName"
])();

// node_modules/@yume-chan/scrcpy/esm/1_17/impl/set-list-encoder.js
function setListEncoders(options) {
  options.encoderName = "_";
}

// node_modules/@yume-chan/scrcpy/esm/1_18/impl/index.js
var impl_exports3 = {};
__export(impl_exports3, {
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults3,
  EncoderRegex: () => EncoderRegex2,
  InjectScrollControlMessage: () => InjectScrollControlMessage,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  ScrollController: () => ScrollController,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer,
  createScrollController: () => createScrollController,
  parseDisplay: () => parseDisplay,
  parseEncoder: () => parseEncoder,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays,
  setListEncoders: () => setListEncoders
});

// node_modules/@yume-chan/scrcpy/esm/1_18/impl/back-or-screen-on.js
var BackOrScreenOnControlMessage2 = extend(impl_exports2.BackOrScreenOnControlMessage, { action: u8() });
function serializeBackOrScreenOnControlMessage2(message) {
  return BackOrScreenOnControlMessage2.serialize(message);
}

// node_modules/@yume-chan/scrcpy/esm/1_18/impl/control-message-types.js
var ControlMessageTypes2 = /* @__PURE__ */ (() => {
  const result = impl_exports2.ControlMessageTypes.slice();
  result.splice(6, 0, ScrcpyControlMessageType.ExpandSettingPanel);
  return result;
})();

// node_modules/@yume-chan/scrcpy/esm/1_18/impl/init.js
var VideoOrientation2 = {
  Initial: -2,
  Unlocked: -1,
  Portrait: 0,
  Landscape: 1,
  PortraitFlipped: 2,
  LandscapeFlipped: 3
};

// node_modules/@yume-chan/scrcpy/esm/1_18/impl/defaults.js
var Defaults3 = /* @__PURE__ */ (() => ({
  ...impl_exports2.Defaults,
  logLevel: "debug",
  lockVideoOrientation: VideoOrientation2.Unlocked,
  powerOffOnClose: false
}))();

// node_modules/@yume-chan/scrcpy/esm/1_18/impl/parse-encoder.js
var EncoderRegex2 = /^\s+scrcpy --encoder '([^']+)'$/;

// node_modules/@yume-chan/scrcpy/esm/1_18/impl/serialize-order.js
var SerializeOrder3 = /* @__PURE__ */ (() => [
  ...impl_exports2.SerializeOrder,
  "powerOffOnClose"
])();

// node_modules/@yume-chan/scrcpy/esm/1_21/impl/index.js
var impl_exports4 = {};
__export(impl_exports4, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults4,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  ScrollController: () => ScrollController,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer,
  createScrollController: () => createScrollController,
  parseDisplay: () => parseDisplay,
  parseEncoder: () => parseEncoder,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays,
  setListEncoders: () => setListEncoders
});

// node_modules/@yume-chan/scrcpy/esm/1_21/impl/defaults.js
var Defaults4 = /* @__PURE__ */ (() => ({
  ...impl_exports3.Defaults,
  clipboardAutosync: true
}))();

// node_modules/@yume-chan/scrcpy/esm/1_21/impl/parse-encoder.js
var EncoderRegex3 = /^\s+scrcpy --encoder-name '([^']+)'$/;

// node_modules/@yume-chan/scrcpy/esm/1_21/impl/serialize.js
function toSnakeCase(input) {
  return input.replace(/([A-Z])/g, "_$1").toLowerCase();
}
function serialize2(options, defaults) {
  const result = [];
  for (const [key, value] of Object.entries(options)) {
    const serializedValue = toScrcpyOptionValue(value, void 0);
    if (serializedValue === void 0) {
      continue;
    }
    const defaultValue = toScrcpyOptionValue(defaults[key], void 0);
    if (serializedValue === defaultValue) {
      continue;
    }
    result.push(`${toSnakeCase(key)}=${serializedValue}`);
  }
  return result;
}

// node_modules/@yume-chan/scrcpy/esm/1_21/impl/set-clipboard.js
var AckClipboardDeviceMessage = struct({ sequence: u64 }, { littleEndian: false });
var SetClipboardControlMessage2 = struct({
  type: u8,
  sequence: u64,
  paste: u8(),
  content: string(u32)
}, { littleEndian: false });
var AckClipboardHandler = class {
  #resolvers = /* @__PURE__ */ new Map();
  #closed = false;
  id = 1;
  async parse(_id, stream) {
    const message = await AckClipboardDeviceMessage.deserialize(stream);
    const resolver = this.#resolvers.get(message.sequence);
    if (resolver) {
      resolver.resolve();
      this.#resolvers.delete(message.sequence);
    }
  }
  close() {
    for (const resolver of this.#resolvers.values()) {
      resolver.reject();
    }
    this.#resolvers.clear();
    this.#closed = true;
  }
  error(e) {
    for (const resolver of this.#resolvers.values()) {
      resolver.reject(e);
    }
    this.#resolvers.clear();
    this.#closed = true;
  }
  serializeSetClipboardControlMessage(message) {
    if (message.sequence === 0n) {
      return SetClipboardControlMessage2.serialize(message);
    }
    if (this.#closed) {
      throw new Error();
    }
    const resolver = new PromiseResolver();
    this.#resolvers.set(message.sequence, resolver);
    return [
      SetClipboardControlMessage2.serialize(message),
      resolver.promise
    ];
  }
};

// node_modules/@yume-chan/scrcpy/esm/1_22/impl/index.js
var impl_exports5 = {};
__export(impl_exports5, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults5,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage2,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  ScrollController: () => ScrollController2,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer,
  createScrollController: () => createScrollController2,
  parseDisplay: () => parseDisplay,
  parseEncoder: () => parseEncoder,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata2,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays,
  setListEncoders: () => setListEncoders
});

// node_modules/@yume-chan/scrcpy/esm/1_22/impl/defaults.js
var Defaults5 = /* @__PURE__ */ (() => ({
  ...impl_exports4.Defaults,
  downsizeOnError: true,
  sendDeviceMeta: true,
  sendDummyByte: true
}))();

// node_modules/@yume-chan/scrcpy/esm/1_22/impl/parse-video-stream-metadata.js
async function parseVideoStreamMetadata2(options, stream) {
  if (!options.sendDeviceMeta) {
    return { stream, metadata: { codec: ScrcpyVideoCodecId.H264 } };
  } else {
    return impl_exports4.parseVideoStreamMetadata(stream);
  }
}

// node_modules/@yume-chan/scrcpy/esm/1_22/impl/scroll-controller.js
var InjectScrollControlMessage2 = extend(impl_exports4.InjectScrollControlMessage, { buttons: s32 });
var ScrollController2 = class extends impl_exports4.ScrollController {
  serializeScrollMessage(message) {
    const processed = this.processMessage(message);
    if (!processed) {
      return void 0;
    }
    return InjectScrollControlMessage2.serialize(processed);
  }
};
function createScrollController2() {
  return new ScrollController2();
}

// node_modules/@yume-chan/scrcpy/esm/1_23/impl/index.js
var impl_exports6 = {};
__export(impl_exports6, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults6,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage2,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController2,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController2,
  parseDisplay: () => parseDisplay,
  parseEncoder: () => parseEncoder,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata2,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays,
  setListEncoders: () => setListEncoders
});

// node_modules/@yume-chan/scrcpy/esm/1_23/impl/defaults.js
var Defaults6 = /* @__PURE__ */ (() => ({
  ...impl_exports5.Defaults,
  cleanup: true
}))();

// node_modules/@yume-chan/scrcpy/esm/1_23/impl/media-stream-transformer.js
var PtsKeyframe = 1n << 62n;
function createMediaStreamTransformer2(options) {
  if (!options.sendFrameMeta) {
    return new TransformStream({
      transform(chunk, controller) {
        controller.enqueue({
          type: "data",
          data: chunk
        });
      }
    });
  }
  const deserializeStream = new StructDeserializeStream(impl_exports5.MediaStreamRawPacket);
  return {
    writable: deserializeStream.writable,
    readable: deserializeStream.readable.pipeThrough(new TransformStream({
      transform(packet, controller) {
        if (packet.pts === impl_exports5.PtsConfig) {
          controller.enqueue({
            type: "configuration",
            data: packet.data
          });
          return;
        }
        if (packet.pts & PtsKeyframe) {
          controller.enqueue({
            type: "data",
            keyframe: true,
            pts: packet.pts & ~PtsKeyframe,
            data: packet.data
          });
          return;
        }
        controller.enqueue({
          type: "data",
          keyframe: false,
          pts: packet.pts,
          data: packet.data
        });
      }
    }))
  };
}

// node_modules/@yume-chan/scrcpy/esm/1_24/impl/defaults.js
var Defaults7 = /* @__PURE__ */ (() => ({
  ...impl_exports6.Defaults,
  powerOn: true
}))();

// node_modules/@yume-chan/scrcpy/esm/1_25/impl/index.js
var impl_exports7 = {};
__export(impl_exports7, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults7,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseDisplay: () => parseDisplay,
  parseEncoder: () => parseEncoder,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata2,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays,
  setListEncoders: () => setListEncoders
});

// node_modules/@yume-chan/scrcpy/esm/1_25/impl/scroll-controller.js
var SignedFloat = field(2, "byob", (value, { buffer: buffer2, index, littleEndian }) => {
  value = clamp(value, -1, 1);
  value = value === 1 ? 32767 : value * 32768;
  setInt16(buffer2, index, value, littleEndian);
}, function* (then, reader, { littleEndian }) {
  const data = yield* then(reader.readExactly(2));
  const value = getInt16(data, 0, littleEndian);
  return value === 32767 ? 1 : value / 32768;
});
var InjectScrollControlMessage3 = /* @__PURE__ */ (() => struct({
  type: u8(ScrcpyControlMessageType.InjectScroll),
  pointerX: u32,
  pointerY: u32,
  videoWidth: u16,
  videoHeight: u16,
  scrollX: SignedFloat,
  scrollY: SignedFloat,
  buttons: u32
}, { littleEndian: false }))();
var ScrollController3 = class {
  serializeScrollMessage(message) {
    return InjectScrollControlMessage3.serialize(message);
  }
};
function createScrollController3() {
  return new ScrollController3();
}

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/index.js
var impl_exports8 = {};
__export(impl_exports8, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults8,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay2,
  parseEncoder: () => parseEncoder2,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/defaults.js
var Defaults8 = /* @__PURE__ */ (() => ({
  ...omit(impl_exports7.Defaults, "bitRate", "codecOptions", "encoderName"),
  scid: void 0,
  videoCodec: "h264",
  videoBitRate: 8e6,
  videoCodecOptions: void 0,
  videoEncoder: void 0,
  audio: true,
  audioCodec: "opus",
  audioBitRate: 128e3,
  audioCodecOptions: void 0,
  audioEncoder: void 0,
  listEncoders: false,
  listDisplays: false,
  sendCodecMeta: true
}))();

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/init.js
var InstanceId = class _InstanceId {
  static NONE = /* @__PURE__ */ new _InstanceId(-1);
  static random() {
    return new _InstanceId(Math.random() * 2147483648 | 0);
  }
  value;
  constructor(value) {
    this.value = value;
  }
  toOptionValue() {
    if (this.value < 0) {
      return void 0;
    }
    return this.value.toString(16);
  }
};

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/inject-touch.js
var InjectTouchControlMessage2 = /* @__PURE__ */ (() => struct({
  type: u8(ScrcpyControlMessageType.InjectTouch),
  action: u8(),
  pointerId: u64,
  pointerX: u32,
  pointerY: u32,
  videoWidth: u16,
  videoHeight: u16,
  pressure: impl_exports7.UnsignedFloat,
  actionButton: u32,
  buttons: u32
}, { littleEndian: false }))();
function serializeInjectTouchControlMessage2(message) {
  return InjectTouchControlMessage2.serialize(message);
}

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/parse-audio-stream-metadata.js
async function parseAudioStreamMetadata(stream, options) {
  const buffered = new BufferedReadableStream(stream);
  const buffer2 = await buffered.readExactly(4);
  const codecMetadataValue = getUint32BigEndian(buffer2, 0);
  switch (codecMetadataValue) {
    case 0:
      return {
        type: "disabled"
      };
    case 1:
      return {
        type: "errored"
      };
  }
  if (options.sendCodecMeta) {
    let codec2;
    switch (codecMetadataValue) {
      case ScrcpyAudioCodec.Raw.metadataValue:
        codec2 = ScrcpyAudioCodec.Raw;
        break;
      case ScrcpyAudioCodec.Opus.metadataValue:
        codec2 = ScrcpyAudioCodec.Opus;
        break;
      case ScrcpyAudioCodec.Aac.metadataValue:
        codec2 = ScrcpyAudioCodec.Aac;
        break;
      case ScrcpyAudioCodec.Flac.metadataValue:
        codec2 = ScrcpyAudioCodec.Flac;
        break;
      default:
        throw new Error(`Unknown audio codec metadata value: ${codecMetadataValue}`);
    }
    return {
      type: "success",
      codec: codec2,
      stream: buffered.release()
    };
  }
  let codec;
  switch (options.audioCodec) {
    case "raw":
      codec = ScrcpyAudioCodec.Raw;
      break;
    case "opus":
      codec = ScrcpyAudioCodec.Opus;
      break;
    case "aac":
      codec = ScrcpyAudioCodec.Aac;
      break;
    case "flac":
      codec = ScrcpyAudioCodec.Flac;
      break;
    default:
      throw new Error(`Unknown audio codec metadata value: ${codecMetadataValue}`);
  }
  return {
    type: "success",
    codec,
    stream: new PushReadableStream(async (controller) => {
      await controller.enqueue(buffer2);
      const stream2 = buffered.release();
      const reader = stream2.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        await controller.enqueue(value);
      }
    })
  };
}

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/parse-display.js
function parseDisplay2(line) {
  const match = line.match(/^\s+--display=(\d+)\s+\(([^)]+)\)$/);
  if (match) {
    const display = {
      id: Number.parseInt(match[1], 10)
    };
    if (match[2] !== "size unknown") {
      display.resolution = match[2];
    }
    return display;
  }
  return void 0;
}

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/parse-encoder.js
var EncoderRegex4 = /^\s+--(video|audio)-codec=(\S+)\s+--\1-encoder='([^']+)'$/;
function parseEncoder2(line) {
  const match = line.match(EncoderRegex4);
  return match ? {
    type: match[1],
    name: match[3],
    codec: match[2]
  } : void 0;
}

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/parse-video-stream-metadata.js
function toCodecId(codec) {
  switch (codec) {
    case "h264":
      return ScrcpyVideoCodecId.H264;
    case "h265":
      return ScrcpyVideoCodecId.H265;
    case "av1":
      return ScrcpyVideoCodecId.AV1;
    default:
      throw new Error(`Unknown video codec: ${codec}`);
  }
}
async function parseAsync(options, stream) {
  const buffered = new BufferedReadableStream(stream);
  let deviceName;
  if (options.sendDeviceMeta) {
    deviceName = await impl_exports7.readString(buffered, 64);
  }
  let codec;
  let width;
  let height;
  if (options.sendCodecMeta) {
    codec = await impl_exports7.readU32(buffered);
    width = await impl_exports7.readU32(buffered);
    height = await impl_exports7.readU32(buffered);
  } else {
    codec = toCodecId(options.videoCodec);
  }
  return {
    stream: buffered.release(),
    metadata: { deviceName, codec, width, height }
  };
}
function parseVideoStreamMetadata3(options, stream) {
  if (!options.sendDeviceMeta && !options.sendCodecMeta) {
    return {
      stream,
      metadata: { codec: toCodecId(options.videoCodec) }
    };
  }
  return parseAsync(options, stream);
}

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/set-list-display.js
function setListDisplays2(options) {
  options.listDisplays = true;
}

// node_modules/@yume-chan/scrcpy/esm/2_0/impl/set-list-encoder.js
function setListEncoders2(options) {
  options.listEncoders = true;
}

// node_modules/@yume-chan/scrcpy/esm/2_1/impl/index.js
var impl_exports9 = {};
__export(impl_exports9, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults9,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay2,
  parseEncoder: () => parseEncoder2,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// node_modules/@yume-chan/scrcpy/esm/2_1/impl/defaults.js
var Defaults9 = /* @__PURE__ */ (() => ({
  ...impl_exports8.Defaults,
  video: true,
  audioSource: "output"
}))();

// node_modules/@yume-chan/scrcpy/esm/2_1/options.js
var ScrcpyOptions2_1 = class {
  static Defaults = Defaults9;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults9, ...init };
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults9);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay2(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder2(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
};

// node_modules/@yume-chan/scrcpy/esm/2_2/impl/defaults.js
var Defaults10 = /* @__PURE__ */ (() => ({
  ...impl_exports9.Defaults,
  videoSource: "display",
  displayId: 0,
  cameraId: void 0,
  cameraSize: void 0,
  cameraFacing: void 0,
  cameraAr: void 0,
  cameraFps: void 0,
  cameraHighSpeed: false,
  listCameras: false,
  listCameraSizes: false
}))();

// node_modules/@yume-chan/scrcpy/esm/2_2/impl/parse-display.js
function parseDisplay3(line) {
  const match = line.match(/^\s+--display-id=(\d+)\s+\(([^)]+)\)$/);
  if (match) {
    const display = {
      id: Number.parseInt(match[1], 10)
    };
    if (match[2] !== "size unknown") {
      display.resolution = match[2];
    }
    return display;
  }
  return void 0;
}

// node_modules/@yume-chan/scrcpy/esm/2_3/impl/index.js
var impl_exports10 = {};
__export(impl_exports10, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes2,
  Crop: () => Crop,
  Defaults: () => Defaults10,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder2,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// node_modules/@yume-chan/scrcpy/esm/2_3/options.js
var ScrcpyOptions2_3 = class {
  static Defaults = Defaults10;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes2;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults10, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.control && this.value.clipboardAutosync) {
      this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
      this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults10);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder2(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
};

// node_modules/@yume-chan/scrcpy/esm/2_4/impl/index.js
var impl_exports11 = {};
__export(impl_exports11, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes3,
  Crop: () => Crop,
  Defaults: () => Defaults10,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UHidCreateControlMessage: () => UHidCreateControlMessage,
  UHidOutputDeviceMessage: () => UHidOutputDeviceMessage,
  UHidOutputStream: () => UHidOutputStream,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder2,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  serializeUHidCreateControlMessage: () => serializeUHidCreateControlMessage,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// node_modules/@yume-chan/scrcpy/esm/2_4/impl/control-message-types.js
var ControlMessageTypes3 = /* @__PURE__ */ (() => [
  ...impl_exports10.ControlMessageTypes,
  ScrcpyControlMessageType.UHidCreate,
  ScrcpyControlMessageType.UHidInput,
  ScrcpyControlMessageType.OpenHardKeyboardSettings
])();

// node_modules/@yume-chan/scrcpy/esm/2_4/impl/serialize-uhid-create.js
var UHidCreateControlMessage = struct({
  type: u8,
  id: u16,
  data: buffer(u16)
}, { littleEndian: false });
function serializeUHidCreateControlMessage(message) {
  return UHidCreateControlMessage.serialize(message);
}

// node_modules/@yume-chan/scrcpy/esm/2_4/impl/uhid-output-stream.js
var UHidOutputDeviceMessage = struct({
  id: u16,
  data: buffer(u16)
}, { littleEndian: false });
var UHidOutputStream = class extends PushReadableStream {
  #controller;
  id = 2;
  constructor() {
    let controller;
    super((controller_) => {
      controller = controller_;
    });
    this.#controller = controller;
  }
  async parse(_id, stream) {
    const message = await UHidOutputDeviceMessage.deserialize(stream);
    await this.#controller.enqueue(message);
  }
  close() {
    this.#controller.close();
  }
  error(e) {
    this.#controller.error(e);
  }
};

// node_modules/@yume-chan/scrcpy/esm/2_4/options.js
var ScrcpyOptions2_4 = class {
  static Defaults = Defaults10;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes3;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #uHidOutput;
  get uHidOutput() {
    return this.#uHidOutput;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults10, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.control) {
      if (this.value.clipboardAutosync) {
        this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
        this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
      }
      this.#uHidOutput = this.#deviceMessageParsers.add(new UHidOutputStream());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults10);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder2(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
  serializeUHidCreateControlMessage(message) {
    return serializeUHidCreateControlMessage(message);
  }
};

// node_modules/@yume-chan/scrcpy/esm/2_6/impl/index.js
var impl_exports12 = {};
__export(impl_exports12, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes3,
  Crop: () => Crop,
  Defaults: () => Defaults11,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UHidCreateControlMessage: () => UHidCreateControlMessage,
  UHidOutputDeviceMessage: () => UHidOutputDeviceMessage,
  UHidOutputStream: () => UHidOutputStream,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder2,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  serializeUHidCreateControlMessage: () => serializeUHidCreateControlMessage,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// node_modules/@yume-chan/scrcpy/esm/2_6/impl/defaults.js
var Defaults11 = /* @__PURE__ */ (() => ({
  ...impl_exports11.Defaults,
  audioDup: false
}))();

// node_modules/@yume-chan/scrcpy/esm/2_7/impl/index.js
var impl_exports13 = {};
__export(impl_exports13, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes4,
  Crop: () => Crop,
  Defaults: () => Defaults11,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UHidCreateControlMessage: () => UHidCreateControlMessage2,
  UHidOutputDeviceMessage: () => UHidOutputDeviceMessage,
  UHidOutputStream: () => UHidOutputStream,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder2,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  serializeUHidCreateControlMessage: () => serializeUHidCreateControlMessage2,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// node_modules/@yume-chan/scrcpy/esm/2_7/impl/control-message-types.js
var ControlMessageTypes4 = /* @__PURE__ */ (() => {
  const result = impl_exports12.ControlMessageTypes.slice();
  result.splice(14, 0, ScrcpyControlMessageType.UHidDestroy);
  return result;
})();

// node_modules/@yume-chan/scrcpy/esm/2_7/impl/serialize-uhid-create.js
var UHidCreateControlMessage2 = struct({
  type: u8,
  id: u16,
  name: string(u8),
  data: buffer(u16)
}, { littleEndian: false });
function serializeUHidCreateControlMessage2(message) {
  return UHidCreateControlMessage2.serialize(message);
}

// node_modules/@yume-chan/scrcpy/esm/2_7/options.js
var ScrcpyOptions2_7 = class {
  static Defaults = Defaults11;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes4;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #uHidOutput;
  get uHidOutput() {
    return this.#uHidOutput;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults11, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.audioDup) {
      this.value.audioSource = "playback";
    }
    if (this.value.control) {
      if (this.value.clipboardAutosync) {
        this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
        this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
      }
      this.#uHidOutput = this.#deviceMessageParsers.add(new UHidOutputStream());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults11);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder2(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
  serializeUHidCreateControlMessage(message) {
    return serializeUHidCreateControlMessage2(message);
  }
};

// node_modules/@yume-chan/scrcpy/esm/3_0/impl/index.js
var impl_exports14 = {};
__export(impl_exports14, {
  AckClipboardDeviceMessage: () => AckClipboardDeviceMessage,
  AckClipboardHandler: () => AckClipboardHandler,
  BackOrScreenOnControlMessage: () => BackOrScreenOnControlMessage2,
  CaptureOrientation: () => CaptureOrientation,
  ClipboardDeviceMessage: () => ClipboardDeviceMessage,
  ClipboardStream: () => ClipboardStream,
  CodecOptions: () => CodecOptions,
  ControlMessageTypes: () => ControlMessageTypes5,
  Crop: () => Crop,
  Defaults: () => Defaults12,
  EncoderRegex: () => EncoderRegex3,
  InjectScrollControlMessage: () => InjectScrollControlMessage3,
  InjectTouchControlMessage: () => InjectTouchControlMessage2,
  InstanceId: () => InstanceId,
  LockOrientation: () => LockOrientation,
  MediaStreamRawPacket: () => MediaStreamRawPacket,
  NewDisplay: () => NewDisplay,
  Orientation: () => Orientation,
  PointerId: () => PointerId,
  PtsConfig: () => PtsConfig,
  PtsKeyframe: () => PtsKeyframe,
  ScrollController: () => ScrollController3,
  SerializeOrder: () => SerializeOrder3,
  SetClipboardControlMessage: () => SetClipboardControlMessage2,
  SignedFloat: () => SignedFloat,
  UHidCreateControlMessage: () => UHidCreateControlMessage2,
  UHidOutputDeviceMessage: () => UHidOutputDeviceMessage,
  UHidOutputStream: () => UHidOutputStream,
  UnsignedFloat: () => UnsignedFloat,
  VideoOrientation: () => VideoOrientation2,
  createMediaStreamTransformer: () => createMediaStreamTransformer2,
  createScrollController: () => createScrollController3,
  parseAudioStreamMetadata: () => parseAudioStreamMetadata,
  parseDisplay: () => parseDisplay3,
  parseEncoder: () => parseEncoder3,
  parseVideoStreamMetadata: () => parseVideoStreamMetadata3,
  readString: () => readString,
  readU16: () => readU16,
  readU32: () => readU32,
  serialize: () => serialize2,
  serializeBackOrScreenOnControlMessage: () => serializeBackOrScreenOnControlMessage2,
  serializeInjectTouchControlMessage: () => serializeInjectTouchControlMessage2,
  serializeSetClipboardControlMessage: () => serializeSetClipboardControlMessage,
  serializeUHidCreateControlMessage: () => serializeUHidCreateControlMessage2,
  setListDisplays: () => setListDisplays2,
  setListEncoders: () => setListEncoders2
});

// node_modules/@yume-chan/scrcpy/esm/3_0/impl/control-message-types.js
var ControlMessageTypes5 = /* @__PURE__ */ (() => [
  ...impl_exports13.ControlMessageTypes,
  ScrcpyControlMessageType.StartApp,
  ScrcpyControlMessageType.ResetVideo
])();

// node_modules/@yume-chan/scrcpy/esm/3_0/impl/defaults.js
var Defaults12 = /* @__PURE__ */ (() => ({
  ...omit(impl_exports13.Defaults, "lockVideoOrientation"),
  captureOrientation: void 0,
  angle: 0,
  screenOffTimeout: void 0,
  listApps: false,
  newDisplay: void 0,
  vdSystemDecorations: true
}))();

// node_modules/@yume-chan/scrcpy/esm/3_0/impl/init.js
var LockOrientation = {
  Unlocked: 0,
  LockedInitial: 1,
  LockedValue: 2
};
var Orientation = {
  Orient0: 0,
  Orient90: 90,
  Orient180: 180,
  Orient270: 270
};
var CaptureOrientation = class _CaptureOrientation {
  static Unlocked = /* @__PURE__ */ (() => new _CaptureOrientation(LockOrientation.Unlocked, Orientation.Orient0, false))();
  lock;
  orientation;
  flip;
  constructor(lock, orientation, flip = false) {
    this.lock = lock;
    this.orientation = orientation;
    this.flip = flip;
  }
  toOptionValue() {
    if (this.lock === LockOrientation.Unlocked && this.orientation === Orientation.Orient0 && !this.flip) {
      return void 0;
    }
    if (this.lock === LockOrientation.LockedInitial) {
      return "@";
    }
    return (this.lock === LockOrientation.LockedValue ? "@" : "") + (this.flip ? "flip" : "") + this.orientation;
  }
};
var NewDisplay = class _NewDisplay {
  static Default = /* @__PURE__ */ new _NewDisplay();
  width;
  height;
  dpi;
  constructor(a, b, c) {
    if (a === void 0) {
      return;
    }
    if (b === void 0) {
      this.dpi = a;
      return;
    }
    this.width = a;
    this.height = b;
    this.dpi = c;
  }
  toOptionValue() {
    if (this.width === void 0 && this.height === void 0 && this.dpi === void 0) {
      return "";
    }
    if (this.width === void 0) {
      return `/${this.dpi}`;
    }
    if (this.dpi === void 0) {
      return `${this.width}x${this.height}`;
    }
    return `${this.width}x${this.height}/${this.dpi}`;
  }
};

// node_modules/@yume-chan/scrcpy/esm/3_0/impl/parse-encoder.js
var EncoderRegex5 = /^\s+--(video|audio)-codec=(\S+)\s+--\1-encoder=(\S+)(?:\s*\((sw|hw|hybrid)\))?(?:\s*\[vendor\])?(?:\s*\(alias for (\S+)\))?$/;
function toHardwareType(value) {
  switch (value) {
    case "sw":
      return "software";
    case "hw":
      return "hardware";
    case "hybrid":
      return "hybrid";
    default:
      throw new Error(`Unknown hardware type: ${value}`);
  }
}
function parseEncoder3(line) {
  const match = line.match(EncoderRegex5);
  return match ? {
    type: match[1],
    name: match[3],
    codec: match[2],
    hardwareType: match[4] ? toHardwareType(match[4]) : void 0,
    vendor: !!match[5],
    aliasFor: match[6]
  } : void 0;
}

// node_modules/@yume-chan/scrcpy/esm/3_0/options.js
var ScrcpyOptions3_0 = class {
  static Defaults = Defaults12;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes5;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #uHidOutput;
  get uHidOutput() {
    return this.#uHidOutput;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults12, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.audioDup) {
      this.value.audioSource = "playback";
    }
    if (this.value.control) {
      if (this.value.clipboardAutosync) {
        this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
        this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
      }
      this.#uHidOutput = this.#deviceMessageParsers.add(new UHidOutputStream());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults12);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder3(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
  serializeUHidCreateControlMessage(message) {
    return serializeUHidCreateControlMessage2(message);
  }
};

// node_modules/@yume-chan/scrcpy/esm/3_0_2.js
var ScrcpyOptions3_0_2 = class extends ScrcpyOptions3_0 {
  constructor(init) {
    super(init);
  }
};

// node_modules/@yume-chan/scrcpy/esm/3_1/impl/defaults.js
var Defaults13 = /* @__PURE__ */ (() => ({
  ...impl_exports14.Defaults,
  vdDestroyContent: false
}))();

// node_modules/@yume-chan/scrcpy/esm/3_1/impl/serialize-uhid-create.js
var UHidCreateControlMessage3 = struct({
  type: u8,
  id: u16,
  vendorId: u16,
  productId: u16,
  name: string(u8),
  data: buffer(u16)
}, { littleEndian: false });
function serializeUHidCreateControlMessage3(message) {
  return UHidCreateControlMessage3.serialize(message);
}

// node_modules/@yume-chan/scrcpy/esm/3_1/options.js
var ScrcpyOptions3_1 = class {
  static Defaults = Defaults13;
  value;
  get controlMessageTypes() {
    return ControlMessageTypes5;
  }
  #clipboard;
  get clipboard() {
    return this.#clipboard;
  }
  #ackClipboardHandler;
  #uHidOutput;
  get uHidOutput() {
    return this.#uHidOutput;
  }
  #deviceMessageParsers = new ScrcpyDeviceMessageParsers();
  get deviceMessageParsers() {
    return this.#deviceMessageParsers;
  }
  constructor(init) {
    this.value = { ...Defaults13, ...init };
    if (this.value.videoSource === "camera") {
      this.value.control = false;
    }
    if (this.value.audioDup) {
      this.value.audioSource = "playback";
    }
    if (this.value.control) {
      if (this.value.clipboardAutosync) {
        this.#clipboard = this.#deviceMessageParsers.add(new ClipboardStream());
        this.#ackClipboardHandler = this.#deviceMessageParsers.add(new AckClipboardHandler());
      }
      this.#uHidOutput = this.#deviceMessageParsers.add(new UHidOutputStream());
    }
  }
  serialize() {
    return serialize2(this.value, Defaults13);
  }
  setListDisplays() {
    setListDisplays2(this.value);
  }
  parseDisplay(line) {
    return parseDisplay3(line);
  }
  setListEncoders() {
    setListEncoders2(this.value);
  }
  parseEncoder(line) {
    return parseEncoder3(line);
  }
  parseVideoStreamMetadata(stream) {
    return parseVideoStreamMetadata3(this.value, stream);
  }
  parseAudioStreamMetadata(stream) {
    return parseAudioStreamMetadata(stream, this.value);
  }
  createMediaStreamTransformer() {
    return createMediaStreamTransformer2(this.value);
  }
  serializeInjectTouchControlMessage(message) {
    return serializeInjectTouchControlMessage2(message);
  }
  serializeBackOrScreenOnControlMessage(message) {
    return serializeBackOrScreenOnControlMessage2(message);
  }
  serializeSetClipboardControlMessage(message) {
    return this.#ackClipboardHandler.serializeSetClipboardControlMessage(message);
  }
  createScrollController() {
    return createScrollController3();
  }
  serializeUHidCreateControlMessage(message) {
    return serializeUHidCreateControlMessage3(message);
  }
};

// node_modules/@yume-chan/scrcpy/esm/codec/av1.js
var AndroidAv1Profile = {
  Main8: 1 << 0,
  Main10: 1 << 1,
  Main10Hdr10: 1 << 12,
  Main10Hdr10Plus: 1 << 13
};
var AndroidAv1Level = {
  Level2: 1 << 0,
  Level21: 1 << 1,
  Level22: 1 << 2,
  Level23: 1 << 3,
  Level3: 1 << 4,
  Level31: 1 << 5,
  Level32: 1 << 6,
  Level33: 1 << 7,
  Level4: 1 << 8,
  Level41: 1 << 9,
  Level42: 1 << 10,
  Level43: 1 << 11,
  Level5: 1 << 12,
  Level51: 1 << 13,
  Level52: 1 << 14,
  Level53: 1 << 15,
  Level6: 1 << 16,
  Level61: 1 << 17,
  Level62: 1 << 18,
  Level63: 1 << 19,
  Level7: 1 << 20,
  Level71: 1 << 21,
  Level72: 1 << 22,
  Level73: 1 << 23
};
var BitReader = class {
  #data;
  #byte;
  #bytePosition = 0;
  #bitPosition = 7;
  get byteAligned() {
    return this.#bitPosition === 7;
  }
  get ended() {
    return this.#bytePosition >= this.#data.length;
  }
  constructor(data) {
    this.#data = data;
    this.#byte = data[0];
  }
  f1() {
    const value = this.#byte >> this.#bitPosition;
    this.#bitPosition -= 1;
    if (this.#bitPosition < 0) {
      this.#bytePosition += 1;
      this.#bitPosition = 7;
      this.#byte = this.#data[this.#bytePosition];
    }
    return value & 1;
  }
  f(n) {
    let value = 0;
    for (; n > 0; n -= 1) {
      value <<= 1;
      value |= this.f1();
    }
    return value;
  }
  skip(n) {
    if (n <= this.#bitPosition + 1) {
      this.#bytePosition += 1;
      this.#bitPosition = 7;
      this.#byte = this.#data[this.#bytePosition];
      return;
    }
    n -= this.#bitPosition + 1;
    this.#bytePosition += 1;
    const bytes = n / 8 | 0;
    if (bytes > 0) {
      this.#bytePosition += bytes;
      n -= bytes * 8;
    }
    this.#bitPosition = 7 - n;
    this.#byte = this.#data[this.#bytePosition];
  }
  readBytes(n) {
    if (!this.byteAligned) {
      throw new Error("Bytes must be byte-aligned");
    }
    const value = this.#data.subarray(this.#bytePosition, this.#bytePosition + n);
    this.#bytePosition += n;
    this.#byte = this.#data[this.#bytePosition];
    return value;
  }
  getPosition() {
    return [this.#bytePosition, this.#bitPosition];
  }
  setPosition([bytePosition, bitPosition]) {
    this.#bytePosition = bytePosition;
    this.#bitPosition = bitPosition;
    this.#byte = this.#data[bytePosition];
  }
};
var ObuType = {
  SequenceHeader: 1,
  TemporalDelimiter: 2,
  FrameHeader: 3,
  TileGroup: 4,
  Metadata: 5,
  Frame: 6,
  RedundantFrameHeader: 7,
  TileList: 8,
  Padding: 15
};
var ColorPrimaries = {
  Bt709: 1,
  Unspecified: 2,
  Bt470M: 4,
  Bt470BG: 5,
  Bt601: 6,
  Smpte240: 7,
  GenericFilm: 8,
  Bt2020: 9,
  Xyz: 10,
  Smpte431: 11,
  Smpte432: 12,
  Ebu3213: 22
};
var TransferCharacteristics = {
  Bt709: 1,
  Unspecified: 2,
  Bt470M: 4,
  Bt470BG: 5,
  Bt601: 6,
  Smpte240: 7,
  Linear: 8,
  Log100: 9,
  Log100Sqrt10: 10,
  Iec61966: 11,
  Bt1361: 12,
  Srgb: 13,
  Bt2020Ten: 14,
  Bt2020Twelve: 15,
  Smpte2084: 16,
  Smpte428: 17,
  Hlg: 18
};
var MatrixCoefficients = {
  Identity: 0,
  Bt709: 1,
  Unspecified: 2,
  Fcc: 4,
  Bt470BG: 5,
  Bt601: 6,
  Smpte240: 7,
  YCgCo: 8,
  Bt2020Ncl: 9,
  Bt2020Cl: 10,
  Smpte2085: 11,
  ChromatNcl: 12,
  ChromatCl: 13,
  ICtCp: 14
};
var Av1 = class _Av1 extends BitReader {
  static ObuType = ObuType;
  static ColorPrimaries = ColorPrimaries;
  static TransferCharacteristics = TransferCharacteristics;
  static MatrixCoefficients = MatrixCoefficients;
  #Leb128Bytes = 0;
  uvlc() {
    let leadingZeros = 0;
    while (!this.f1()) {
      leadingZeros += 1;
    }
    if (leadingZeros >= 32) {
      return 2 ** 32 - 1;
    }
    const value = this.f(leadingZeros);
    return value + (1 << leadingZeros >>> 0) - 1;
  }
  leb128() {
    if (!this.byteAligned) {
      throw new Error("LEB128 must be byte-aligned");
    }
    let value = 0n;
    this.#Leb128Bytes = 0;
    for (let i = 0n; i < 8n; i += 1n) {
      const leb128_byte = this.f(8);
      value |= BigInt(leb128_byte & 127) << 7n * i;
      this.#Leb128Bytes += 1;
      if ((leb128_byte & 128) == 0) {
        break;
      }
    }
    return value;
  }
  *annexBBitstream() {
    while (!this.ended) {
      const temporal_unit_size = this.leb128();
      yield* this.temporalUnit(temporal_unit_size);
    }
  }
  *temporalUnit(sz) {
    while (sz > 0) {
      const frame_unit_size = this.leb128();
      sz -= BigInt(this.#Leb128Bytes);
      yield* this.frameUnit(frame_unit_size);
      sz -= frame_unit_size;
    }
  }
  *frameUnit(sz) {
    while (sz > 0) {
      const obu_length = this.leb128();
      sz -= BigInt(this.#Leb128Bytes);
      const obu = this.openBitstreamUnit(obu_length);
      if (obu) {
        yield obu;
      }
      sz -= obu_length;
    }
  }
  #OperatingPointIdc = 0;
  openBitstreamUnit(sz) {
    const obu_header = this.obuHeader();
    let obu_size;
    if (obu_header.obu_has_size_field) {
      obu_size = this.leb128();
    } else if (sz !== void 0) {
      obu_size = sz - 1n - (obu_header.obu_extension_flag ? 1n : 0n);
    } else {
      throw new Error("obu_has_size_field must be true");
    }
    const startPosition = this.getPosition();
    if (obu_header.obu_type !== _Av1.ObuType.SequenceHeader && obu_header.obu_type !== _Av1.ObuType.TemporalDelimiter && this.#OperatingPointIdc !== 0 && obu_header.obu_extension_header) {
      const inTemporalLayer = !!(this.#OperatingPointIdc & 1 << obu_header.obu_extension_header.temporal_id);
      const inSpatialLayer = !!(this.#OperatingPointIdc & 1 << obu_header.obu_extension_header.spatial_id + 8);
      if (!inTemporalLayer || !inSpatialLayer) {
        this.skip(Number(obu_size));
        return;
      }
    }
    let sequence_header_obu;
    switch (obu_header.obu_type) {
      case _Av1.ObuType.SequenceHeader:
        sequence_header_obu = this.sequenceHeaderObu();
        break;
    }
    const currentPosition = this.getPosition();
    const payloadBits = (currentPosition[0] - startPosition[0]) * 8 + (startPosition[1] - currentPosition[1]);
    if (obu_size > 0) {
      this.skip(Number(obu_size) * 8 - payloadBits);
    }
    return {
      obu_header,
      obu_size,
      sequence_header_obu
    };
  }
  obuHeader() {
    const obu_forbidden_bit = !!this.f1();
    if (obu_forbidden_bit) {
      throw new Error("Invalid data");
    }
    const obu_type = this.f(4);
    const obu_extension_flag = !!this.f1();
    const obu_has_size_field = !!this.f1();
    this.f1();
    let obu_extension_header;
    if (obu_extension_flag) {
      obu_extension_header = this.obuExtensionHeader();
    }
    return {
      obu_type,
      obu_extension_flag,
      obu_has_size_field,
      obu_extension_header
    };
  }
  obuExtensionHeader() {
    const temporal_id = this.f(3);
    const spatial_id = this.f(2);
    this.skip(3);
    return { temporal_id, spatial_id };
  }
  static SelectScreenContentTools = 2;
  static SelectIntegerMv = 2;
  sequenceHeaderObu() {
    const seq_profile = this.f(3);
    const still_picture = !!this.f1();
    const reduced_still_picture_header = !!this.f1();
    let timing_info_present_flag = false;
    let timing_info;
    let decoder_model_info_present_flag = false;
    let decoder_model_info;
    let initial_display_delay_present_flag = false;
    let operating_points_cnt_minus_1 = 0;
    const operating_point_idc = [];
    const seq_level_idx = [];
    const seq_tier = [];
    const decoder_model_present_for_this_op = [];
    const initial_display_delay_present_for_this_op = [];
    let operating_parameters_info;
    let initial_display_delay_minus_1;
    if (reduced_still_picture_header) {
      operating_point_idc[0] = 0;
      seq_level_idx[0] = this.f(5);
      seq_tier[0] = 0;
      decoder_model_present_for_this_op[0] = false;
      initial_display_delay_present_for_this_op[0] = false;
    } else {
      timing_info_present_flag = !!this.f1();
      if (timing_info_present_flag) {
        timing_info = this.timingInfo();
        decoder_model_info_present_flag = !!this.f1();
        if (decoder_model_info_present_flag) {
          decoder_model_info = this.decoderModelInfo();
          operating_parameters_info = [];
        }
      }
      initial_display_delay_present_flag = !!this.f1();
      if (initial_display_delay_present_flag) {
        initial_display_delay_minus_1 = [];
      }
      operating_points_cnt_minus_1 = this.f(5);
      for (let i = 0; i <= operating_points_cnt_minus_1; i += 1) {
        operating_point_idc[i] = this.f(12);
        seq_level_idx[i] = this.f(5);
        if (seq_level_idx[i] > 7) {
          seq_tier[i] = this.f1();
        } else {
          seq_tier[i] = 0;
        }
        if (decoder_model_info_present_flag) {
          decoder_model_present_for_this_op[i] = !!this.f1();
          if (decoder_model_present_for_this_op[i]) {
            operating_parameters_info[i] = this.operatingParametersInfo(decoder_model_info);
          }
        } else {
          decoder_model_present_for_this_op[i] = false;
        }
        if (initial_display_delay_present_flag) {
          initial_display_delay_present_for_this_op[i] = !!this.f1();
          if (initial_display_delay_present_for_this_op[i]) {
            initial_display_delay_minus_1[i] = this.f(4);
          }
        }
      }
    }
    const operatingPoint = this.chooseOperatingPoint();
    this.#OperatingPointIdc = operating_point_idc[operatingPoint];
    const frame_width_bits_minus_1 = this.f(4);
    const frame_height_bits_minus_1 = this.f(4);
    const max_frame_width_minus_1 = this.f(frame_width_bits_minus_1 + 1);
    const max_frame_height_minus_1 = this.f(frame_height_bits_minus_1 + 1);
    let frame_id_numbers_present_flag = false;
    let delta_frame_id_length_minus_2;
    let additional_frame_id_length_minus_1;
    if (!reduced_still_picture_header) {
      frame_id_numbers_present_flag = !!this.f1();
      if (frame_id_numbers_present_flag) {
        delta_frame_id_length_minus_2 = this.f(4);
        additional_frame_id_length_minus_1 = this.f(3);
      }
    }
    const use_128x128_superblock = !!this.f1();
    const enable_filter_intra = !!this.f1();
    const enable_intra_edge_filter = !!this.f1();
    let enable_interintra_compound = false;
    let enable_masked_compound = false;
    let enable_warped_motion = false;
    let enable_dual_filter = false;
    let enable_order_hint = false;
    let enable_jnt_comp = false;
    let enable_ref_frame_mvs = false;
    let seq_choose_screen_content_tools = false;
    let seq_force_screen_content_tools = _Av1.SelectScreenContentTools;
    let seq_choose_integer_mv = false;
    let seq_force_integer_mv = _Av1.SelectIntegerMv;
    let order_hint_bits_minus_1;
    if (!reduced_still_picture_header) {
      enable_interintra_compound = !!this.f1();
      enable_masked_compound = !!this.f1();
      enable_warped_motion = !!this.f1();
      enable_dual_filter = !!this.f1();
      enable_order_hint = !!this.f1();
      if (enable_order_hint) {
        enable_jnt_comp = !!this.f1();
        enable_ref_frame_mvs = !!this.f1();
      }
      seq_choose_screen_content_tools = !!this.f1();
      if (!seq_choose_screen_content_tools) {
        seq_force_screen_content_tools = this.f1();
      }
      if (seq_force_screen_content_tools > 0) {
        seq_choose_integer_mv = !!this.f1();
        if (!seq_choose_integer_mv) {
          seq_force_integer_mv = this.f1();
        }
      }
      if (enable_order_hint) {
        order_hint_bits_minus_1 = this.f(3);
      }
    }
    const enable_superres = !!this.f1();
    const enable_cdef = !!this.f1();
    const enable_restoration = !!this.f1();
    const color_config = this.colorConfig(seq_profile);
    const film_grain_params_present = !!this.f1();
    return {
      seq_profile,
      still_picture,
      reduced_still_picture_header,
      timing_info_present_flag,
      timing_info,
      decoder_model_info_present_flag,
      decoder_model_info,
      initial_display_delay_present_flag,
      initial_display_delay_minus_1,
      operating_points_cnt_minus_1,
      operating_point_idc,
      seq_level_idx,
      seq_tier,
      decoder_model_present_for_this_op,
      operating_parameters_info,
      initial_display_delay_present_for_this_op,
      frame_width_bits_minus_1,
      frame_height_bits_minus_1,
      max_frame_width_minus_1,
      max_frame_height_minus_1,
      frame_id_numbers_present_flag,
      delta_frame_id_length_minus_2,
      additional_frame_id_length_minus_1,
      use_128x128_superblock,
      enable_filter_intra,
      enable_intra_edge_filter,
      enable_interintra_compound,
      enable_masked_compound,
      enable_warped_motion,
      enable_dual_filter,
      enable_order_hint,
      enable_jnt_comp,
      enable_ref_frame_mvs,
      seq_choose_screen_content_tools,
      seq_force_screen_content_tools,
      seq_choose_integer_mv,
      seq_force_integer_mv,
      order_hint_bits_minus_1,
      enable_superres,
      enable_cdef,
      enable_restoration,
      color_config,
      film_grain_params_present
    };
  }
  searchSequenceHeaderObu() {
    while (!this.ended) {
      const obu = this.openBitstreamUnit();
      if (!obu) {
        continue;
      }
      if (obu.sequence_header_obu) {
        return obu.sequence_header_obu;
      }
    }
    return void 0;
  }
  timingInfo() {
    const num_units_in_display_tick = this.f(32);
    const time_scale = this.f(32);
    const equal_picture_interval = !!this.f1();
    let num_ticks_per_picture_minus_1;
    if (equal_picture_interval) {
      num_ticks_per_picture_minus_1 = this.uvlc();
    }
    return {
      num_units_in_display_tick,
      time_scale,
      equal_picture_interval,
      num_ticks_per_picture_minus_1
    };
  }
  decoderModelInfo() {
    const buffer_delay_length_minus_1 = this.f(5);
    const num_units_in_decoding_tick = this.f(32);
    const buffer_removal_time_length_minus_1 = this.f(5);
    const frame_presentation_time_length_minus_1 = this.f(5);
    return {
      buffer_delay_length_minus_1,
      num_units_in_decoding_tick,
      buffer_removal_time_length_minus_1,
      frame_presentation_time_length_minus_1
    };
  }
  operatingParametersInfo(decoderModelInfo) {
    const n = decoderModelInfo.buffer_delay_length_minus_1 + 1;
    const decoder_buffer_delay = this.f(n);
    const encoder_buffer_delay = this.f(n);
    const low_delay_mode_flag = !!this.f1();
    return {
      decoder_buffer_delay,
      encoder_buffer_delay,
      low_delay_mode_flag
    };
  }
  chooseOperatingPoint() {
    return 0;
  }
  colorConfig(seq_profile) {
    const high_bitdepth = !!this.f1();
    let twelve_bit = false;
    let BitDepth = 8;
    if (seq_profile === 2 && high_bitdepth) {
      twelve_bit = !!this.f1();
      BitDepth = twelve_bit ? 12 : 10;
    } else if (seq_profile <= 2) {
      BitDepth = high_bitdepth ? 10 : 8;
    }
    let mono_chrome = false;
    if (seq_profile === 1) {
      mono_chrome = !!this.f1();
    }
    const color_description_present_flag = !!this.f1();
    let color_primaries = _Av1.ColorPrimaries.Unspecified;
    let transfer_characteristics = _Av1.TransferCharacteristics.Unspecified;
    let matrix_coefficients = _Av1.MatrixCoefficients.Unspecified;
    if (color_description_present_flag) {
      color_primaries = this.f(8);
      transfer_characteristics = this.f(8);
      matrix_coefficients = this.f(8);
    }
    let color_range = false;
    let subsampling_x;
    let subsampling_y;
    let chroma_sample_position = 0;
    let separate_uv_delta_q = false;
    if (mono_chrome) {
      color_range = !!this.f1();
      subsampling_x = true;
      subsampling_y = true;
    } else {
      if (color_primaries === _Av1.ColorPrimaries.Bt709 && transfer_characteristics === _Av1.TransferCharacteristics.Srgb && matrix_coefficients === _Av1.MatrixCoefficients.Identity) {
        color_range = true;
        subsampling_x = false;
        subsampling_y = false;
      } else {
        color_range = !!this.f1();
        switch (seq_profile) {
          case 0:
            subsampling_x = true;
            subsampling_y = true;
            break;
          case 1:
            subsampling_x = false;
            subsampling_y = false;
            break;
          default:
            if (BitDepth == 12) {
              subsampling_x = !!this.f1();
              if (subsampling_x) {
                subsampling_y = !!this.f1();
              } else {
                subsampling_y = false;
              }
            } else {
              subsampling_x = true;
              subsampling_y = false;
            }
            break;
        }
        if (subsampling_x && subsampling_y) {
          chroma_sample_position = this.f(2);
        }
      }
      separate_uv_delta_q = !!this.f1();
    }
    return {
      high_bitdepth,
      twelve_bit,
      BitDepth,
      mono_chrome,
      color_description_present_flag,
      color_primaries,
      transfer_characteristics,
      matrix_coefficients,
      color_range,
      subsampling_x,
      subsampling_y,
      chroma_sample_position,
      separate_uv_delta_q
    };
  }
};

// node_modules/@yume-chan/scrcpy/esm/codec/nalu.js
function* annexBSplitNalu(buffer2) {
  let start = -1;
  let zeroCount = 0;
  let inEmulation = false;
  for (let i = 0; i < buffer2.length; i += 1) {
    const byte = buffer2[i];
    if (inEmulation) {
      if (byte > 3) {
        throw new Error("Invalid data");
      }
      inEmulation = false;
      continue;
    }
    if (byte === 0) {
      zeroCount += 1;
      continue;
    }
    const prevZeroCount = zeroCount;
    zeroCount = 0;
    if (start === -1) {
      if (prevZeroCount >= 2 && byte === 1) {
        start = i + 1;
        continue;
      }
      throw new Error("Invalid data");
    }
    if (prevZeroCount < 2) {
      continue;
    }
    if (byte === 1) {
      yield buffer2.subarray(start, i - prevZeroCount);
      start = i + 1;
      continue;
    }
    if (prevZeroCount > 2) {
      throw new Error("Invalid data");
    }
    switch (byte) {
      case 2:
        throw new Error("Invalid data");
      case 3:
        inEmulation = true;
        break;
      default:
        break;
    }
  }
  if (inEmulation) {
    throw new Error("Invalid data");
  }
  yield buffer2.subarray(start, buffer2.length);
}
var NaluSodbBitReader = class {
  #nalu;
  // logical length is `#byteLength * 8 + (7 - #stopBitIndex)`
  #byteLength;
  #stopBitIndex;
  #zeroCount = 0;
  // logical position is `#bytePosition * 8 + (7 - #bitPosition)`
  #bytePosition = 0;
  #bitPosition = 7;
  #byte = 0;
  get byteLength() {
    return this.#byteLength;
  }
  get stopBitIndex() {
    return this.#stopBitIndex;
  }
  get bytePosition() {
    return this.#bytePosition;
  }
  get bitPosition() {
    return this.#bitPosition;
  }
  get ended() {
    return this.#bytePosition >= this.#byteLength && this.#bitPosition <= this.#stopBitIndex;
  }
  constructor(nalu) {
    this.#nalu = nalu;
    for (let i = nalu.length - 1; i >= 0; i -= 1) {
      if (this.#nalu[i] === 0) {
        continue;
      }
      const byte = nalu[i];
      for (let j = 0; j < 8; j += 1) {
        if ((byte >> j & 1) === 1) {
          this.#byteLength = i;
          this.#stopBitIndex = j;
          this.#loadByte();
          return;
        }
      }
    }
    throw new Error("Stop bit not found");
  }
  #loadByte() {
    this.#byte = this.#nalu[this.#bytePosition];
    if (this.#zeroCount === 2 && this.#byte === 3) {
      this.#zeroCount = 0;
      this.#bytePosition += 1;
      this.#loadByte();
      return;
    }
    if (this.#byte === 0) {
      this.#zeroCount += 1;
    } else {
      this.#zeroCount = 0;
    }
  }
  next() {
    if (this.ended) {
      throw new Error("Bit index out of bounds");
    }
    const value = this.#byte >> this.#bitPosition & 1;
    this.#bitPosition -= 1;
    if (this.#bitPosition < 0) {
      this.#bytePosition += 1;
      this.#bitPosition = 7;
      this.#loadByte();
    }
    return value;
  }
  read(length) {
    if (length > 32) {
      throw new Error("Read length too large");
    }
    let result = 0;
    for (let i = 0; i < length; i += 1) {
      result = result << 1 | this.next();
    }
    return result;
  }
  /**
   * Throws an error if the current position is invalid for `skip`.
   *
   * Usually it will throw if `ended` is `true`,
   * except when the bit position is at the stop bit,
   * in which case `ended` will be `true`, but it won't throw.
   * `skip` can skip all remaining bits, and stop at the end position.
   * The next `next` call will throw since there is no more bits to read.
   */
  #checkSkipPosition() {
    if (this.#bytePosition >= this.#byteLength && this.#bitPosition < this.#stopBitIndex) {
      throw new Error("Bit index out of bounds");
    }
  }
  skip(length) {
    if (length <= this.#bitPosition + 1) {
      this.#bitPosition -= length;
      this.#checkSkipPosition();
      return;
    }
    length -= this.#bitPosition + 1;
    this.#bytePosition += 1;
    this.#bitPosition = 7;
    this.#loadByte();
    this.#checkSkipPosition();
    for (; length >= 8; length -= 8) {
      this.#bytePosition += 1;
      this.#loadByte();
      this.#checkSkipPosition();
    }
    this.#bitPosition = 7 - length;
    this.#checkSkipPosition();
  }
  decodeExponentialGolombNumber() {
    let length = 0;
    while (this.next() === 0) {
      length += 1;
    }
    if (length === 0) {
      return 0;
    }
    return (1 << length | this.read(length)) - 1;
  }
  #save() {
    return {
      zeroCount: this.#zeroCount,
      bytePosition: this.#bytePosition,
      bitPosition: this.#bitPosition,
      byte: this.#byte
    };
  }
  #restore(state) {
    this.#zeroCount = state.zeroCount;
    this.#bytePosition = state.bytePosition;
    this.#bitPosition = state.bitPosition;
    this.#byte = state.byte;
  }
  peek(length) {
    const state = this.#save();
    const result = this.read(length);
    this.#restore(state);
    return result;
  }
  readBytes(length) {
    const result = new Uint8Array(length);
    for (let i = 0; i < length; i += 1) {
      result[i] = this.read(8);
    }
    return result;
  }
  peekBytes(length) {
    const state = this.#save();
    const result = this.readBytes(length);
    this.#restore(state);
    return result;
  }
};

// node_modules/@yume-chan/scrcpy/esm/codec/h264.js
var AndroidAvcProfile = {
  Baseline: 1 << 0,
  Main: 1 << 1,
  Extended: 1 << 2,
  High: 1 << 3,
  High10: 1 << 4,
  High422: 1 << 5,
  High444: 1 << 6,
  ConstrainedBaseline: 1 << 16,
  ConstrainedHigh: 1 << 19
};
var AndroidAvcLevel = {
  Level1: 1 << 0,
  Level1b: 1 << 1,
  Level11: 1 << 2,
  Level12: 1 << 3,
  Level13: 1 << 4,
  Level2: 1 << 5,
  Level21: 1 << 6,
  Level22: 1 << 7,
  Level3: 1 << 8,
  Level31: 1 << 9,
  Level32: 1 << 10,
  Level4: 1 << 11,
  Level41: 1 << 12,
  Level42: 1 << 13,
  Level5: 1 << 14,
  Level51: 1 << 15,
  Level52: 1 << 16,
  Level6: 1 << 17,
  Level61: 1 << 18,
  Level62: 1 << 19
};
function h264ParseSequenceParameterSet(nalu) {
  const reader = new NaluSodbBitReader(nalu);
  if (reader.next() !== 0) {
    throw new Error("Invalid data");
  }
  const nal_ref_idc = reader.read(2);
  const nal_unit_type = reader.read(5);
  if (nal_unit_type !== 7) {
    throw new Error("Invalid data");
  }
  if (nal_ref_idc === 0) {
    throw new Error("Invalid data");
  }
  const profile_idc = reader.read(8);
  const constraint_set = reader.peek(8);
  const constraint_set0_flag = !!reader.next();
  const constraint_set1_flag = !!reader.next();
  const constraint_set2_flag = !!reader.next();
  const constraint_set3_flag = !!reader.next();
  const constraint_set4_flag = !!reader.next();
  const constraint_set5_flag = !!reader.next();
  if (reader.read(2) !== 0) {
    throw new Error("Invalid data");
  }
  const level_idc = reader.read(8);
  const seq_parameter_set_id = reader.decodeExponentialGolombNumber();
  if (profile_idc === 100 || profile_idc === 110 || profile_idc === 122 || profile_idc === 244 || profile_idc === 44 || profile_idc === 83 || profile_idc === 86 || profile_idc === 118 || profile_idc === 128 || profile_idc === 138 || profile_idc === 139 || profile_idc === 134) {
    const chroma_format_idc = reader.decodeExponentialGolombNumber();
    if (chroma_format_idc === 3) {
      reader.next();
    }
    reader.decodeExponentialGolombNumber();
    reader.decodeExponentialGolombNumber();
    reader.next();
    const seq_scaling_matrix_present_flag = !!reader.next();
    if (seq_scaling_matrix_present_flag) {
      const seq_scaling_list_present_flag = [];
      for (let i = 0; i < (chroma_format_idc !== 3 ? 8 : 12); i += 1) {
        seq_scaling_list_present_flag[i] = !!reader.next();
        if (seq_scaling_list_present_flag[i])
          if (i < 6) {
          } else {
          }
      }
    }
  }
  reader.decodeExponentialGolombNumber();
  const pic_order_cnt_type = reader.decodeExponentialGolombNumber();
  if (pic_order_cnt_type === 0) {
    reader.decodeExponentialGolombNumber();
  } else if (pic_order_cnt_type === 1) {
    reader.next();
    reader.decodeExponentialGolombNumber();
    reader.decodeExponentialGolombNumber();
    const num_ref_frames_in_pic_order_cnt_cycle = reader.decodeExponentialGolombNumber();
    const offset_for_ref_frame = [];
    for (let i = 0; i < num_ref_frames_in_pic_order_cnt_cycle; i += 1) {
      offset_for_ref_frame[i] = reader.decodeExponentialGolombNumber();
    }
  }
  reader.decodeExponentialGolombNumber();
  reader.next();
  const pic_width_in_mbs_minus1 = reader.decodeExponentialGolombNumber();
  const pic_height_in_map_units_minus1 = reader.decodeExponentialGolombNumber();
  const frame_mbs_only_flag = reader.next();
  if (!frame_mbs_only_flag) {
    reader.next();
  }
  reader.next();
  const frame_cropping_flag = !!reader.next();
  let frame_crop_left_offset;
  let frame_crop_right_offset;
  let frame_crop_top_offset;
  let frame_crop_bottom_offset;
  if (frame_cropping_flag) {
    frame_crop_left_offset = reader.decodeExponentialGolombNumber();
    frame_crop_right_offset = reader.decodeExponentialGolombNumber();
    frame_crop_top_offset = reader.decodeExponentialGolombNumber();
    frame_crop_bottom_offset = reader.decodeExponentialGolombNumber();
  } else {
    frame_crop_left_offset = 0;
    frame_crop_right_offset = 0;
    frame_crop_top_offset = 0;
    frame_crop_bottom_offset = 0;
  }
  const vui_parameters_present_flag = !!reader.next();
  if (vui_parameters_present_flag) {
  }
  return {
    profile_idc,
    constraint_set,
    constraint_set0_flag,
    constraint_set1_flag,
    constraint_set2_flag,
    constraint_set3_flag,
    constraint_set4_flag,
    constraint_set5_flag,
    level_idc,
    seq_parameter_set_id,
    pic_width_in_mbs_minus1,
    pic_height_in_map_units_minus1,
    frame_mbs_only_flag,
    frame_cropping_flag,
    frame_crop_left_offset,
    frame_crop_right_offset,
    frame_crop_top_offset,
    frame_crop_bottom_offset
  };
}
function h264SearchConfiguration(buffer2) {
  let sequenceParameterSet;
  let pictureParameterSet;
  for (const nalu of annexBSplitNalu(buffer2)) {
    const naluType = nalu[0] & 31;
    switch (naluType) {
      case 7:
        sequenceParameterSet = nalu;
        if (pictureParameterSet) {
          return {
            sequenceParameterSet,
            pictureParameterSet
          };
        }
        break;
      case 8:
        pictureParameterSet = nalu;
        if (sequenceParameterSet) {
          return {
            sequenceParameterSet,
            pictureParameterSet
          };
        }
        break;
      default:
        break;
    }
  }
  throw new Error("Invalid data");
}
function h264ParseConfiguration(data) {
  const { sequenceParameterSet, pictureParameterSet } = h264SearchConfiguration(data);
  const { profile_idc: profileIndex, constraint_set: constraintSet, level_idc: levelIndex, pic_width_in_mbs_minus1, pic_height_in_map_units_minus1, frame_mbs_only_flag, frame_crop_left_offset, frame_crop_right_offset, frame_crop_top_offset, frame_crop_bottom_offset } = h264ParseSequenceParameterSet(sequenceParameterSet);
  const encodedWidth = (pic_width_in_mbs_minus1 + 1) * 16;
  const encodedHeight = (pic_height_in_map_units_minus1 + 1) * (2 - frame_mbs_only_flag) * 16;
  const cropLeft = frame_crop_left_offset * 2;
  const cropRight = frame_crop_right_offset * 2;
  const cropTop = frame_crop_top_offset * 2;
  const cropBottom = frame_crop_bottom_offset * 2;
  const croppedWidth = encodedWidth - cropLeft - cropRight;
  const croppedHeight = encodedHeight - cropTop - cropBottom;
  return {
    pictureParameterSet,
    sequenceParameterSet,
    profileIndex,
    constraintSet,
    levelIndex,
    encodedWidth,
    encodedHeight,
    cropLeft,
    cropRight,
    cropTop,
    cropBottom,
    croppedWidth,
    croppedHeight
  };
}

// node_modules/@yume-chan/scrcpy/esm/codec/h265.js
var AndroidHevcProfile = {
  Main: 1 << 0,
  Main10: 1 << 1,
  MainStill: 1 << 2,
  Main10Hdr10: 1 << 12,
  Main10Hdr10Plus: 1 << 13
};
var AndroidHevcLevel = {
  MainTierLevel1: 1 << 0,
  HighTierLevel1: 1 << 1,
  MainTierLevel2: 1 << 2,
  HighTierLevel2: 1 << 3,
  MainTierLevel21: 1 << 4,
  HighTierLevel21: 1 << 5,
  MainTierLevel3: 1 << 6,
  HighTierLevel3: 1 << 7,
  MainTierLevel31: 1 << 8,
  HighTierLevel31: 1 << 9,
  MainTierLevel4: 1 << 10,
  HighTierLevel4: 1 << 11,
  MainTierLevel41: 1 << 12,
  HighTierLevel41: 1 << 13,
  MainTierLevel5: 1 << 14,
  HighTierLevel5: 1 << 15,
  MainTierLevel51: 1 << 16,
  HighTierLevel51: 1 << 17,
  MainTierLevel52: 1 << 18,
  HighTierLevel52: 1 << 19,
  MainTierLevel6: 1 << 20,
  HighTierLevel6: 1 << 21,
  MainTierLevel61: 1 << 22,
  HighTierLevel61: 1 << 23,
  MainTierLevel62: 1 << 24,
  HighTierLevel62: 1 << 25
};
function getSubWidthC(chroma_format_idc) {
  switch (chroma_format_idc) {
    case 0:
    case 3:
      return 1;
    case 1:
    case 2:
      return 2;
    default:
      throw new Error("Invalid chroma_format_idc");
  }
}
function getSubHeightC(chroma_format_idc) {
  switch (chroma_format_idc) {
    case 0:
    case 2:
    case 3:
      return 1;
    case 1:
      return 2;
    default:
      throw new Error("Invalid chroma_format_idc");
  }
}
function h265ParseNaluHeader(nalu) {
  const reader = new NaluSodbBitReader(nalu);
  if (reader.next() !== 0) {
    throw new Error("Invalid NALU header");
  }
  const nal_unit_type = reader.read(6);
  const nuh_layer_id = reader.read(6);
  const nuh_temporal_id_plus1 = reader.read(3);
  return {
    nal_unit_type,
    nuh_layer_id,
    nuh_temporal_id_plus1
  };
}
function h265ParseVideoParameterSet(nalu) {
  const reader = new NaluSodbBitReader(nalu);
  const vps_video_parameter_set_id = reader.read(4);
  const vps_base_layer_internal_flag = !!reader.next();
  const vps_base_layer_available_flag = !!reader.next();
  const vps_max_layers_minus1 = reader.read(6);
  const vps_max_sub_layers_minus1 = reader.read(3);
  const vps_temporal_id_nesting_flag = !!reader.next();
  reader.skip(16);
  const profileTierLevel = h265ParseProfileTierLevel(reader, true, vps_max_sub_layers_minus1);
  const vps_sub_layer_ordering_info_present_flag = !!reader.next();
  const vps_max_dec_pic_buffering_minus1 = [];
  const vps_max_num_reorder_pics = [];
  const vps_max_latency_increase_plus1 = [];
  for (let i = vps_sub_layer_ordering_info_present_flag ? 0 : vps_max_sub_layers_minus1; i <= vps_max_sub_layers_minus1; i += 1) {
    vps_max_dec_pic_buffering_minus1[i] = reader.decodeExponentialGolombNumber();
    vps_max_num_reorder_pics[i] = reader.decodeExponentialGolombNumber();
    vps_max_latency_increase_plus1[i] = reader.decodeExponentialGolombNumber();
  }
  const vps_max_layer_id = reader.read(6);
  const vps_num_layer_sets_minus1 = reader.decodeExponentialGolombNumber();
  const layer_id_included_flag = [];
  for (let i = 1; i <= vps_num_layer_sets_minus1; i += 1) {
    layer_id_included_flag[i] = [];
    for (let j = 0; j <= vps_max_layer_id; j += 1) {
      layer_id_included_flag[i][j] = !!reader.next();
    }
  }
  const vps_timing_info_present_flag = !!reader.next();
  let vps_num_units_in_tick;
  let vps_time_scale;
  let vps_poc_proportional_to_timing_flag;
  let vps_num_ticks_poc_diff_one_minus1;
  let vps_num_hrd_parameters;
  let hrd_layer_set_idx;
  let cprms_present_flag;
  let hrdParameters;
  if (vps_timing_info_present_flag) {
    vps_num_units_in_tick = reader.read(32);
    vps_time_scale = reader.read(32);
    vps_poc_proportional_to_timing_flag = !!reader.next();
    if (vps_poc_proportional_to_timing_flag) {
      vps_num_ticks_poc_diff_one_minus1 = reader.decodeExponentialGolombNumber();
    }
    vps_num_hrd_parameters = reader.decodeExponentialGolombNumber();
    hrd_layer_set_idx = [];
    cprms_present_flag = [true];
    hrdParameters = [];
    for (let i = 0; i < vps_num_hrd_parameters; i += 1) {
      hrd_layer_set_idx[i] = reader.decodeExponentialGolombNumber();
      if (i > 0) {
        cprms_present_flag[i] = !!reader.next();
      }
      hrdParameters[i] = h265ParseHrdParameters(reader, cprms_present_flag[i], vps_max_sub_layers_minus1);
    }
  }
  const vps_extension_flag = !!reader.next();
  return {
    vps_video_parameter_set_id,
    vps_base_layer_internal_flag,
    vps_base_layer_available_flag,
    vps_max_layers_minus1,
    vps_max_sub_layers_minus1,
    vps_temporal_id_nesting_flag,
    profileTierLevel,
    vps_sub_layer_ordering_info_present_flag,
    vps_max_dec_pic_buffering_minus1,
    vps_max_num_reorder_pics,
    vps_max_latency_increase_plus1,
    vps_max_layer_id,
    vps_num_layer_sets_minus1,
    layer_id_included_flag,
    vps_timing_info_present_flag,
    vps_num_units_in_tick,
    vps_time_scale,
    vps_poc_proportional_to_timing_flag,
    vps_num_ticks_poc_diff_one_minus1,
    vps_num_hrd_parameters,
    hrd_layer_set_idx,
    cprms_present_flag,
    hrdParameters,
    vps_extension_flag
  };
}
function h265ParseSequenceParameterSet(nalu) {
  const reader = new NaluSodbBitReader(nalu);
  const sps_video_parameter_set_id = reader.read(4);
  const sps_max_sub_layers_minus1 = reader.read(3);
  const sps_temporal_id_nesting_flag = !!reader.next();
  const profileTierLevel = h265ParseProfileTierLevel(reader, true, sps_max_sub_layers_minus1);
  const sps_seq_parameter_set_id = reader.decodeExponentialGolombNumber();
  const chroma_format_idc = reader.decodeExponentialGolombNumber();
  let separate_colour_plane_flag;
  if (chroma_format_idc === 3) {
    separate_colour_plane_flag = !!reader.next();
  }
  const pic_width_in_luma_samples = reader.decodeExponentialGolombNumber();
  const pic_height_in_luma_samples = reader.decodeExponentialGolombNumber();
  const conformance_window_flag = !!reader.next();
  let conf_win_left_offset;
  let conf_win_right_offset;
  let conf_win_top_offset;
  let conf_win_bottom_offset;
  if (conformance_window_flag) {
    conf_win_left_offset = reader.decodeExponentialGolombNumber();
    conf_win_right_offset = reader.decodeExponentialGolombNumber();
    conf_win_top_offset = reader.decodeExponentialGolombNumber();
    conf_win_bottom_offset = reader.decodeExponentialGolombNumber();
  }
  const bit_depth_luma_minus8 = reader.decodeExponentialGolombNumber();
  const bit_depth_chroma_minus8 = reader.decodeExponentialGolombNumber();
  const log2_max_pic_order_cnt_lsb_minus4 = reader.decodeExponentialGolombNumber();
  const sps_max_dec_pic_buffering_minus1 = [];
  const sps_max_num_reorder_pics = [];
  const sps_max_latency_increase_plus1 = [];
  const sps_sub_layer_ordering_info_present_flag = !!reader.next();
  for (let i = sps_sub_layer_ordering_info_present_flag ? 0 : sps_max_sub_layers_minus1; i <= sps_max_sub_layers_minus1; i += 1) {
    sps_max_dec_pic_buffering_minus1[i] = reader.decodeExponentialGolombNumber();
    sps_max_num_reorder_pics[i] = reader.decodeExponentialGolombNumber();
    sps_max_latency_increase_plus1[i] = reader.decodeExponentialGolombNumber();
  }
  const log2_min_luma_coding_block_size_minus3 = reader.decodeExponentialGolombNumber();
  const log2_diff_max_min_luma_coding_block_size = reader.decodeExponentialGolombNumber();
  const log2_min_luma_transform_block_size_minus2 = reader.decodeExponentialGolombNumber();
  const log2_diff_max_min_luma_transform_block_size = reader.decodeExponentialGolombNumber();
  const max_transform_hierarchy_depth_inter = reader.decodeExponentialGolombNumber();
  const max_transform_hierarchy_depth_intra = reader.decodeExponentialGolombNumber();
  const scaling_list_enabled_flag = !!reader.next();
  let sps_scaling_list_data_present_flag;
  let scalingListData;
  if (scaling_list_enabled_flag) {
    sps_scaling_list_data_present_flag = !!reader.next();
    if (sps_scaling_list_data_present_flag) {
      scalingListData = h265ParseScalingListData(reader);
    }
  }
  const amp_enabled_flag = !!reader.next();
  const sample_adaptive_offset_enabled_flag = !!reader.next();
  const pcm_enabled_flag = !!reader.next();
  let pcm_sample_bit_depth_luma_minus1;
  let pcm_sample_bit_depth_chroma_minus1;
  let log2_min_pcm_luma_coding_block_size_minus3;
  let log2_diff_max_min_pcm_luma_coding_block_size;
  let pcm_loop_filter_disabled_flag;
  if (pcm_enabled_flag) {
    pcm_sample_bit_depth_luma_minus1 = reader.read(4);
    pcm_sample_bit_depth_chroma_minus1 = reader.read(4);
    log2_min_pcm_luma_coding_block_size_minus3 = reader.decodeExponentialGolombNumber();
    log2_diff_max_min_pcm_luma_coding_block_size = reader.decodeExponentialGolombNumber();
    pcm_loop_filter_disabled_flag = !!reader.next();
  }
  const num_short_term_ref_pic_sets = reader.decodeExponentialGolombNumber();
  const shortTermRefPicSets = [];
  for (let i = 0; i < num_short_term_ref_pic_sets; i += 1) {
    shortTermRefPicSets[i] = h265ParseShortTermReferencePictureSet(reader, i, num_short_term_ref_pic_sets, shortTermRefPicSets);
  }
  const long_term_ref_pics_present_flag = !!reader.next();
  let num_long_term_ref_pics_sps;
  let lt_ref_pic_poc_lsb_sps;
  let used_by_curr_pic_lt_sps_flag;
  if (long_term_ref_pics_present_flag) {
    num_long_term_ref_pics_sps = reader.decodeExponentialGolombNumber();
    lt_ref_pic_poc_lsb_sps = [];
    used_by_curr_pic_lt_sps_flag = [];
    for (let i = 0; i < num_long_term_ref_pics_sps; i += 1) {
      lt_ref_pic_poc_lsb_sps[i] = reader.read(log2_max_pic_order_cnt_lsb_minus4 + 4);
      used_by_curr_pic_lt_sps_flag[i] = !!reader.next();
    }
  }
  const sps_temporal_mvp_enabled_flag = !!reader.next();
  const strong_intra_smoothing_enabled_flag = !!reader.next();
  const vui_parameters_present_flag = !!reader.next();
  let vuiParameters;
  if (vui_parameters_present_flag) {
    vuiParameters = h265ParseVuiParameters(reader, sps_max_sub_layers_minus1);
  }
  const sps_extension_present_flag = !!reader.next();
  let sps_range_extension_flag;
  let sps_multilayer_extension_flag;
  let sps_3d_extension_flag;
  let sps_scc_extension_flag;
  let sps_extension_4bits;
  if (sps_extension_present_flag) {
    sps_range_extension_flag = !!reader.next();
    sps_multilayer_extension_flag = !!reader.next();
    sps_3d_extension_flag = !!reader.next();
    sps_scc_extension_flag = !!reader.next();
    sps_extension_4bits = reader.read(4);
  }
  if (sps_range_extension_flag) {
    throw new Error("Not implemented");
  }
  let spsMultilayerExtension;
  if (sps_multilayer_extension_flag) {
    spsMultilayerExtension = h265ParseSpsMultilayerExtension(reader);
  }
  let sps3dExtension;
  if (sps_3d_extension_flag) {
    sps3dExtension = h265ParseSps3dExtension(reader);
  }
  if (sps_scc_extension_flag) {
    throw new Error("Not implemented");
  }
  let sps_extension_data_flag;
  if (sps_extension_4bits) {
    sps_extension_data_flag = [];
    let i = 0;
    while (!reader.ended) {
      sps_extension_data_flag[i] = !!reader.next();
      i += 1;
    }
  }
  return {
    sps_video_parameter_set_id,
    sps_max_sub_layers_minus1,
    sps_temporal_id_nesting_flag,
    profileTierLevel,
    sps_seq_parameter_set_id,
    chroma_format_idc,
    separate_colour_plane_flag,
    pic_width_in_luma_samples,
    pic_height_in_luma_samples,
    conformance_window_flag,
    conf_win_left_offset,
    conf_win_right_offset,
    conf_win_top_offset,
    conf_win_bottom_offset,
    bit_depth_luma_minus8,
    bit_depth_chroma_minus8,
    log2_max_pic_order_cnt_lsb_minus4,
    sps_sub_layer_ordering_info_present_flag,
    sps_max_dec_pic_buffering_minus1,
    sps_max_num_reorder_pics,
    sps_max_latency_increase_plus1,
    log2_min_luma_coding_block_size_minus3,
    log2_diff_max_min_luma_coding_block_size,
    log2_min_luma_transform_block_size_minus2,
    log2_diff_max_min_luma_transform_block_size,
    max_transform_hierarchy_depth_inter,
    max_transform_hierarchy_depth_intra,
    scaling_list_enabled_flag,
    sps_scaling_list_data_present_flag,
    scalingListData,
    amp_enabled_flag,
    sample_adaptive_offset_enabled_flag,
    pcm_enabled_flag,
    pcm_sample_bit_depth_luma_minus1,
    pcm_sample_bit_depth_chroma_minus1,
    log2_min_pcm_luma_coding_block_size_minus3,
    log2_diff_max_min_pcm_luma_coding_block_size,
    pcm_loop_filter_disabled_flag,
    num_short_term_ref_pic_sets,
    shortTermRefPicSets,
    long_term_ref_pics_present_flag,
    num_long_term_ref_pics_sps,
    lt_ref_pic_poc_lsb_sps,
    used_by_curr_pic_lt_sps_flag,
    sps_temporal_mvp_enabled_flag,
    strong_intra_smoothing_enabled_flag,
    vui_parameters_present_flag,
    vuiParameters,
    sps_extension_present_flag,
    sps_range_extension_flag,
    sps_multilayer_extension_flag,
    sps_3d_extension_flag,
    sps_scc_extension_flag,
    sps_extension_4bits,
    spsMultilayerExtension,
    sps3dExtension,
    sps_extension_data_flag
  };
}
function h265ParseProfileTier(reader) {
  const profile_space = reader.read(2);
  const tier_flag = !!reader.next();
  const profile_idc = reader.read(5);
  const profileCompatibilitySet = reader.peekBytes(4);
  const profile_compatibility_flag = [];
  for (let j = 0; j < 32; j += 1) {
    profile_compatibility_flag[j] = !!reader.next();
  }
  const constraintSet = reader.peekBytes(6);
  const progressive_source_flag = !!reader.next();
  const interlaced_source_flag = !!reader.next();
  const non_packed_constraint_flag = !!reader.next();
  const frame_only_constraint_flag = !!reader.next();
  let max_12bit_constraint_flag;
  let max_10bit_constraint_flag;
  let max_8bit_constraint_flag;
  let max_422chroma_constraint_flag;
  let max_420chroma_constraint_flag;
  let max_monochrome_constraint_flag;
  let intra_constraint_flag;
  let one_picture_only_constraint_flag;
  let lower_bit_rate_constraint_flag;
  let max_14bit_constraint_flag;
  if (profile_idc === 4 || profile_compatibility_flag[4] || profile_idc === 5 || profile_compatibility_flag[5] || profile_idc === 6 || profile_compatibility_flag[6] || profile_idc === 7 || profile_compatibility_flag[7] || profile_idc === 8 || profile_compatibility_flag[8] || profile_idc === 9 || profile_compatibility_flag[9] || profile_idc === 10 || profile_compatibility_flag[10] || profile_idc === 11 || profile_compatibility_flag[11]) {
    max_12bit_constraint_flag = !!reader.next();
    max_10bit_constraint_flag = !!reader.next();
    max_8bit_constraint_flag = !!reader.next();
    max_422chroma_constraint_flag = !!reader.next();
    max_420chroma_constraint_flag = !!reader.next();
    max_monochrome_constraint_flag = !!reader.next();
    intra_constraint_flag = !!reader.next();
    one_picture_only_constraint_flag = !!reader.next();
    lower_bit_rate_constraint_flag = !!reader.next();
    if (profile_idc === 5 || profile_compatibility_flag[5] || profile_idc === 9 || profile_compatibility_flag[9] || profile_idc === 10 || profile_compatibility_flag[10] || profile_idc === 11 || profile_compatibility_flag[11]) {
      max_14bit_constraint_flag = !!reader.next();
      reader.skip(33);
    } else {
      reader.skip(34);
    }
  } else if (profile_idc === 2 || profile_compatibility_flag[2]) {
    reader.skip(7);
    one_picture_only_constraint_flag = !!reader.next();
    reader.skip(35);
  } else {
    reader.skip(43);
  }
  let inbld_flag;
  if (profile_idc === 1 || profile_compatibility_flag[1] || profile_idc === 2 || profile_compatibility_flag[2] || profile_idc === 3 || profile_compatibility_flag[3] || profile_idc === 4 || profile_compatibility_flag[4] || profile_idc === 5 || profile_compatibility_flag[5] || profile_idc === 9 || profile_compatibility_flag[9] || profile_idc === 11 || profile_compatibility_flag[11]) {
    inbld_flag = !!reader.next();
  } else {
    reader.skip(1);
  }
  return {
    profile_space,
    tier_flag,
    profile_idc,
    profileCompatibilitySet,
    profile_compatibility_flag,
    constraintSet,
    progressive_source_flag,
    interlaced_source_flag,
    non_packed_constraint_flag,
    frame_only_constraint_flag,
    max_12bit_constraint_flag,
    max_10bit_constraint_flag,
    max_8bit_constraint_flag,
    max_422chroma_constraint_flag,
    max_420chroma_constraint_flag,
    max_monochrome_constraint_flag,
    intra_constraint_flag,
    one_picture_only_constraint_flag,
    lower_bit_rate_constraint_flag,
    max_14bit_constraint_flag,
    inbld_flag
  };
}
function h265ParseProfileTierLevel(reader, profilePresentFlag, maxNumSubLayersMinus1) {
  let generalProfileTier;
  if (profilePresentFlag) {
    generalProfileTier = h265ParseProfileTier(reader);
  }
  const general_level_idc = reader.read(8);
  const sub_layer_profile_present_flag = [];
  const sub_layer_level_present_flag = [];
  for (let i = 0; i < maxNumSubLayersMinus1; i += 1) {
    sub_layer_profile_present_flag[i] = !!reader.next();
    sub_layer_level_present_flag[i] = !!reader.next();
  }
  if (maxNumSubLayersMinus1 > 0) {
    for (let i = maxNumSubLayersMinus1; i < 8; i += 1) {
      reader.read(2);
    }
  }
  const subLayerProfileTier = [];
  const sub_layer_level_idc = [];
  for (let i = 0; i < maxNumSubLayersMinus1; i += 1) {
    if (sub_layer_profile_present_flag[i]) {
      subLayerProfileTier[i] = h265ParseProfileTier(reader);
    }
    if (sub_layer_level_present_flag[i]) {
      sub_layer_level_idc[i] = reader.read(8);
    }
  }
  return {
    generalProfileTier,
    general_level_idc,
    sub_layer_profile_present_flag,
    sub_layer_level_present_flag,
    subLayerProfileTier,
    sub_layer_level_idc
  };
}
function h265ParseScalingListData(reader) {
  const scaling_list = [];
  for (let sizeId = 0; sizeId < 4; sizeId += 1) {
    scaling_list[sizeId] = [];
    for (let matrixId = 0; matrixId < 6; matrixId += sizeId === 3 ? 3 : 1) {
      const scaling_list_pred_mode_flag = !!reader.next();
      if (!scaling_list_pred_mode_flag) {
        reader.decodeExponentialGolombNumber();
      } else {
        let nextCoef = 8;
        const coefNum = Math.min(64, 1 << 4 + (sizeId << 1));
        if (sizeId > 1) {
          const scaling_list_dc_coef_minus8 = reader.decodeExponentialGolombNumber();
          nextCoef = scaling_list_dc_coef_minus8 + 8;
        }
        scaling_list[sizeId][matrixId] = [];
        for (let i = 0; i < coefNum; i += 1) {
          const scaling_list_delta_coef = reader.decodeExponentialGolombNumber();
          nextCoef = (nextCoef + scaling_list_delta_coef + 256) % 256;
          scaling_list[sizeId][matrixId][i] = nextCoef;
        }
      }
    }
  }
  return scaling_list;
}
function h265ParseShortTermReferencePictureSet(reader, stRpsIdx, num_short_term_ref_pic_sets, sets) {
  let inter_ref_pic_set_prediction_flag = false;
  if (stRpsIdx !== 0) {
    inter_ref_pic_set_prediction_flag = !!reader.next();
  }
  let delta_idx_minus1 = 0;
  let delta_rps_sign = false;
  let abs_delta_rps_minus1 = 0;
  const used_by_curr_pic_flag = [];
  const use_delta_flag = [];
  let num_negative_pics = 0;
  let num_positive_pics = 0;
  const delta_poc_s0_minus1 = [];
  const used_by_curr_pic_s0_flag = [];
  const delta_poc_s1_minus1 = [];
  const used_by_curr_pic_s1_flag = [];
  if (inter_ref_pic_set_prediction_flag) {
    if (stRpsIdx === num_short_term_ref_pic_sets) {
      delta_idx_minus1 = reader.decodeExponentialGolombNumber();
    }
    delta_rps_sign = !!reader.next();
    abs_delta_rps_minus1 = reader.decodeExponentialGolombNumber();
    const RefRpsIdx = stRpsIdx - (delta_idx_minus1 + 1);
    const RefRps = sets[RefRpsIdx];
    const NumDeltaPocs_RefRpsIdx = RefRps.num_negative_pics + RefRps.num_positive_pics;
    for (let j = 0; j <= NumDeltaPocs_RefRpsIdx; j += 1) {
      used_by_curr_pic_flag[j] = !!reader.next();
      if (!used_by_curr_pic_flag[j]) {
        use_delta_flag[j] = !!reader.next();
      } else {
        use_delta_flag[j] = true;
      }
    }
    const DeltaRps = (1 - 2 * Number(delta_rps_sign)) * (abs_delta_rps_minus1 + 1);
    const RefPocS0 = [];
    const RefPocS1 = [];
    const pocS0 = [];
    const pocS1 = [];
    let dPoc = 0;
    for (let i2 = 0; i2 < RefRps.num_negative_pics; i2 += 1) {
      dPoc -= RefRps.delta_poc_s0_minus1[i2] + 1;
      RefPocS0[i2] = dPoc;
    }
    dPoc = 0;
    for (let i2 = 0; i2 < RefRps.num_positive_pics; i2 += 1) {
      dPoc += RefRps.delta_poc_s1_minus1[i2] + 1;
      RefPocS1[i2] = dPoc;
    }
    let i = 0;
    if (RefRps.num_positive_pics > 0) {
      for (let j = RefRps.num_positive_pics - 1; j >= 0; j -= 1) {
        dPoc = RefPocS1[j] + DeltaRps;
        if (dPoc < 0 && use_delta_flag[RefRps.num_negative_pics + j]) {
          pocS0[i] = dPoc;
          used_by_curr_pic_s0_flag[i] = used_by_curr_pic_flag[RefRps.num_negative_pics + j];
          i += 1;
        }
      }
    }
    if (DeltaRps < 0 && use_delta_flag[NumDeltaPocs_RefRpsIdx]) {
      pocS0[i] = DeltaRps;
      used_by_curr_pic_s0_flag[i] = used_by_curr_pic_flag[NumDeltaPocs_RefRpsIdx];
      i += 1;
    }
    for (let j = 0; j < RefRps.num_negative_pics; j += 1) {
      dPoc = RefPocS0[j] + DeltaRps;
      if (dPoc < 0 && use_delta_flag[j]) {
        pocS0[i] = dPoc;
        used_by_curr_pic_s0_flag[i] = used_by_curr_pic_flag[j];
        i += 1;
      }
    }
    num_negative_pics = i;
    let prev = 0;
    for (i = 0; i < num_negative_pics; i += 1) {
      const current = pocS0[i];
      delta_poc_s0_minus1[i] = -(current - prev - 1);
      prev = current;
    }
    i = 0;
    if (RefRps.num_negative_pics > 0) {
      for (let j = RefRps.num_negative_pics - 1; j >= 0; j -= 1) {
        dPoc = RefPocS0[j] + DeltaRps;
        if (dPoc > 0 && use_delta_flag[j]) {
          pocS1[i] = dPoc;
          used_by_curr_pic_s1_flag[i] = used_by_curr_pic_flag[j];
          i += 1;
        }
      }
    }
    if (DeltaRps > 0 && use_delta_flag[NumDeltaPocs_RefRpsIdx]) {
      pocS1[i] = DeltaRps;
      used_by_curr_pic_s1_flag[i] = used_by_curr_pic_flag[NumDeltaPocs_RefRpsIdx];
      i += 1;
    }
    for (let j = 0; j < RefRps.num_positive_pics; j += 1) {
      dPoc = RefPocS1[j] + DeltaRps;
      if (dPoc > 0 && use_delta_flag[RefRps.num_negative_pics + j]) {
        pocS1[i] = dPoc;
        used_by_curr_pic_s1_flag[i] = used_by_curr_pic_flag[RefRps.num_negative_pics + j];
        i += 1;
      }
    }
    num_positive_pics = i;
    prev = 0;
    for (i = 0; i < num_positive_pics; i += 1) {
      const current = pocS1[i];
      delta_poc_s1_minus1[i] = current - prev - 1;
      prev = current;
    }
  } else {
    num_negative_pics = reader.decodeExponentialGolombNumber();
    num_positive_pics = reader.decodeExponentialGolombNumber();
    for (let i = 0; i < num_negative_pics; i += 1) {
      delta_poc_s0_minus1[i] = reader.decodeExponentialGolombNumber();
      used_by_curr_pic_s0_flag[i] = !!reader.next();
    }
    for (let i = 0; i < num_positive_pics; i += 1) {
      delta_poc_s1_minus1[i] = reader.decodeExponentialGolombNumber();
      used_by_curr_pic_s1_flag[i] = !!reader.next();
    }
  }
  return {
    stRpsIdx,
    num_short_term_ref_pic_sets,
    inter_ref_pic_set_prediction_flag,
    delta_idx_minus1,
    delta_rps_sign,
    abs_delta_rps_minus1,
    used_by_curr_pic_flag,
    use_delta_flag,
    num_negative_pics,
    num_positive_pics,
    delta_poc_s0_minus1,
    used_by_curr_pic_s0_flag,
    delta_poc_s1_minus1,
    used_by_curr_pic_s1_flag
  };
}
var H265AspectRatioIndicator = {
  Unspecified: 0,
  Square: 1,
  _12_11: 2,
  _10_11: 3,
  _16_11: 4,
  _40_33: 5,
  _24_11: 6,
  _20_11: 7,
  _32_11: 8,
  _80_33: 9,
  _18_11: 10,
  _15_11: 11,
  _64_33: 12,
  _160_99: 13,
  _4_3: 15,
  _3_2: 16,
  _2_1: 17,
  Extended: 255
};
function h265ParseVuiParameters(reader, sps_max_sub_layers_minus1) {
  const aspect_ratio_info_present_flag = !!reader.next();
  let aspect_ratio_idc;
  let sar_width;
  let sar_height;
  if (aspect_ratio_info_present_flag) {
    aspect_ratio_idc = reader.read(8);
    if (aspect_ratio_idc === H265AspectRatioIndicator.Extended) {
      sar_width = reader.read(16);
      sar_height = reader.read(16);
    }
  }
  const overscan_info_present_flag = !!reader.next();
  let overscan_appropriate_flag;
  if (overscan_info_present_flag) {
    overscan_appropriate_flag = !!reader.next();
  }
  const video_signal_type_present_flag = !!reader.next();
  let video_format;
  let video_full_range_flag;
  let colour_description_present_flag;
  let colour_primaries;
  let transfer_characteristics;
  let matrix_coeffs;
  if (video_signal_type_present_flag) {
    video_format = reader.read(3);
    video_full_range_flag = !!reader.next();
    colour_description_present_flag = !!reader.next();
    if (colour_description_present_flag) {
      colour_primaries = reader.read(8);
      transfer_characteristics = reader.read(8);
      matrix_coeffs = reader.read(8);
    }
  }
  const chroma_loc_info_present_flag = !!reader.next();
  let chroma_sample_loc_type_top_field;
  let chroma_sample_loc_type_bottom_field;
  if (chroma_loc_info_present_flag) {
    chroma_sample_loc_type_top_field = reader.decodeExponentialGolombNumber();
    chroma_sample_loc_type_bottom_field = reader.decodeExponentialGolombNumber();
  }
  const neutral_chroma_indication_flag = !!reader.next();
  const field_seq_flag = !!reader.next();
  const frame_field_info_present_flag = !!reader.next();
  const default_display_window_flag = !!reader.next();
  let def_disp_win_left_offset;
  let def_disp_win_right_offset;
  let def_disp_win_top_offset;
  let def_disp_win_bottom_offset;
  if (default_display_window_flag) {
    def_disp_win_left_offset = reader.decodeExponentialGolombNumber();
    def_disp_win_right_offset = reader.decodeExponentialGolombNumber();
    def_disp_win_top_offset = reader.decodeExponentialGolombNumber();
    def_disp_win_bottom_offset = reader.decodeExponentialGolombNumber();
  }
  const vui_timing_info_present_flag = !!reader.next();
  let vui_num_units_in_tick;
  let vui_time_scale;
  let vui_poc_proportional_to_timing_flag;
  let vui_num_ticks_poc_diff_one_minus1;
  let vui_hrd_parameters_present_flag;
  let vui_hrd_parameters;
  if (vui_timing_info_present_flag) {
    vui_num_units_in_tick = reader.read(32);
    vui_time_scale = reader.read(32);
    vui_poc_proportional_to_timing_flag = !!reader.next();
    if (vui_poc_proportional_to_timing_flag) {
      vui_num_ticks_poc_diff_one_minus1 = reader.decodeExponentialGolombNumber();
    }
    vui_hrd_parameters_present_flag = !!reader.next();
    if (vui_hrd_parameters_present_flag) {
      vui_hrd_parameters = h265ParseHrdParameters(reader, true, sps_max_sub_layers_minus1);
    }
  }
  const bitstream_restriction_flag = !!reader.next();
  let tiles_fixed_structure_flag;
  let motion_vectors_over_pic_boundaries_flag;
  let restricted_ref_pic_lists_flag;
  let min_spatial_segmentation_idc;
  let max_bytes_per_pic_denom;
  let max_bits_per_min_cu_denom;
  let log2_max_mv_length_horizontal;
  let log2_max_mv_length_vertical;
  if (bitstream_restriction_flag) {
    tiles_fixed_structure_flag = !!reader.next();
    motion_vectors_over_pic_boundaries_flag = !!reader.next();
    restricted_ref_pic_lists_flag = !!reader.next();
    min_spatial_segmentation_idc = reader.decodeExponentialGolombNumber();
    max_bytes_per_pic_denom = reader.decodeExponentialGolombNumber();
    max_bits_per_min_cu_denom = reader.decodeExponentialGolombNumber();
    log2_max_mv_length_horizontal = reader.decodeExponentialGolombNumber();
    log2_max_mv_length_vertical = reader.decodeExponentialGolombNumber();
  }
  return {
    aspect_ratio_info_present_flag,
    aspect_ratio_idc,
    sar_width,
    sar_height,
    overscan_info_present_flag,
    overscan_appropriate_flag,
    video_signal_type_present_flag,
    video_format,
    video_full_range_flag,
    colour_description_present_flag,
    colour_primaries,
    transfer_characteristics,
    matrix_coeffs,
    chroma_loc_info_present_flag,
    chroma_sample_loc_type_top_field,
    chroma_sample_loc_type_bottom_field,
    neutral_chroma_indication_flag,
    field_seq_flag,
    frame_field_info_present_flag,
    default_display_window_flag,
    def_disp_win_left_offset,
    def_disp_win_right_offset,
    def_disp_win_top_offset,
    def_disp_win_bottom_offset,
    vui_timing_info_present_flag,
    vui_num_units_in_tick,
    vui_time_scale,
    vui_poc_proportional_to_timing_flag,
    vui_num_ticks_poc_diff_one_minus1,
    vui_hrd_parameters_present_flag,
    vui_hrd_parameters,
    bitstream_restriction_flag,
    tiles_fixed_structure_flag,
    motion_vectors_over_pic_boundaries_flag,
    restricted_ref_pic_lists_flag,
    min_spatial_segmentation_idc,
    max_bytes_per_pic_denom,
    max_bits_per_min_cu_denom,
    log2_max_mv_length_horizontal,
    log2_max_mv_length_vertical
  };
}
function h265ParseHrdParameters(reader, commonInfPresentFlag, maxNumSubLayersMinus1) {
  let nal_hrd_parameters_present_flag;
  let vcl_hrd_parameters_present_flag;
  let sub_pic_hrd_params_present_flag;
  let tick_divisor_minus2;
  let du_cpb_removal_delay_increment_length_minus1;
  let sub_pic_cpb_params_in_pic_timing_sei_flag;
  let dpb_output_delay_du_length_minus1;
  let bit_rate_scale;
  let cpb_size_scale;
  let cpb_size_du_scale;
  let initial_cpb_removal_delay_length_minus1;
  let au_cpb_removal_delay_length_minus1;
  let dpb_output_delay_length_minus1;
  if (commonInfPresentFlag) {
    nal_hrd_parameters_present_flag = !!reader.next();
    vcl_hrd_parameters_present_flag = !!reader.next();
    if (nal_hrd_parameters_present_flag || vcl_hrd_parameters_present_flag) {
      sub_pic_hrd_params_present_flag = !!reader.next();
      if (sub_pic_hrd_params_present_flag) {
        tick_divisor_minus2 = reader.read(8);
        du_cpb_removal_delay_increment_length_minus1 = reader.read(5);
        sub_pic_cpb_params_in_pic_timing_sei_flag = !!reader.next();
        dpb_output_delay_du_length_minus1 = reader.read(5);
      }
      bit_rate_scale = reader.read(4);
      cpb_size_scale = reader.read(4);
      if (sub_pic_hrd_params_present_flag) {
        cpb_size_du_scale = reader.read(4);
      }
      initial_cpb_removal_delay_length_minus1 = reader.read(5);
      au_cpb_removal_delay_length_minus1 = reader.read(5);
      dpb_output_delay_length_minus1 = reader.read(5);
    }
  }
  const fixed_pic_rate_general_flag = [];
  const fixed_pic_rate_within_cvs_flag = [];
  const elemental_duration_in_tc_minus1 = [];
  const low_delay_hrd_flag = [];
  const cpb_cnt_minus1 = [];
  const nalHrdParameters = [];
  const vclHrdParameters = [];
  for (let i = 0; i <= maxNumSubLayersMinus1; i += 1) {
    fixed_pic_rate_general_flag[i] = !!reader.next();
    if (!fixed_pic_rate_general_flag[i]) {
      fixed_pic_rate_within_cvs_flag[i] = !!reader.next();
    }
    if (fixed_pic_rate_within_cvs_flag[i]) {
      elemental_duration_in_tc_minus1[i] = reader.decodeExponentialGolombNumber();
    } else {
      low_delay_hrd_flag[i] = !!reader.next();
    }
    if (!low_delay_hrd_flag[i]) {
      cpb_cnt_minus1[i] = reader.decodeExponentialGolombNumber();
    }
    if (nal_hrd_parameters_present_flag) {
      nalHrdParameters[i] = h265ParseSubLayerHrdParameters(reader, i, getCpbCnt(cpb_cnt_minus1[i]));
    }
    if (vcl_hrd_parameters_present_flag) {
      vclHrdParameters[i] = h265ParseSubLayerHrdParameters(reader, i, getCpbCnt(cpb_cnt_minus1[i]));
    }
  }
  return {
    nal_hrd_parameters_present_flag,
    vcl_hrd_parameters_present_flag,
    sub_pic_hrd_params_present_flag,
    tick_divisor_minus2,
    du_cpb_removal_delay_increment_length_minus1,
    sub_pic_cpb_params_in_pic_timing_sei_flag,
    dpb_output_delay_du_length_minus1,
    bit_rate_scale,
    cpb_size_scale,
    cpb_size_du_scale,
    initial_cpb_removal_delay_length_minus1,
    au_cpb_removal_delay_length_minus1,
    dpb_output_delay_length_minus1,
    fixed_pic_rate_general_flag,
    fixed_pic_rate_within_cvs_flag,
    elemental_duration_in_tc_minus1,
    low_delay_hrd_flag,
    cpb_cnt_minus1,
    nalHrdParameters,
    vclHrdParameters
  };
}
function h265ParseSubLayerHrdParameters(reader, subLayerId, CpbCnt) {
  const bit_rate_value_minus1 = [];
  const cpb_size_value_minus1 = [];
  const cpb_size_du_value_minus1 = [];
  const bit_rate_du_value_minus1 = [];
  const cbr_flag = [];
  for (let i = 0; i < CpbCnt; i += 1) {
    bit_rate_value_minus1[i] = reader.decodeExponentialGolombNumber();
    cpb_size_value_minus1[i] = reader.decodeExponentialGolombNumber();
    if (subLayerId > 0) {
      cbr_flag[i] = !!reader.next();
    }
  }
  return {
    bit_rate_value_minus1,
    cpb_size_value_minus1,
    cpb_size_du_value_minus1,
    bit_rate_du_value_minus1,
    cbr_flag
  };
}
function getCpbCnt(cpb_cnt_minus_1) {
  return cpb_cnt_minus_1 + 1;
}
function h265SearchConfiguration(buffer2) {
  let videoParameterSet;
  let sequenceParameterSet;
  let pictureParameterSet;
  let count = 0;
  for (const nalu of annexBSplitNalu(buffer2)) {
    const header = h265ParseNaluHeader(nalu);
    const raw = {
      ...header,
      data: nalu,
      rbsp: nalu.subarray(2)
    };
    switch (header.nal_unit_type) {
      case 32:
        videoParameterSet = raw;
        break;
      case 33:
        sequenceParameterSet = raw;
        break;
      case 34:
        pictureParameterSet = raw;
        break;
      default:
        continue;
    }
    count += 1;
    if (count === 3) {
      return {
        videoParameterSet,
        sequenceParameterSet,
        pictureParameterSet
      };
    }
  }
  throw new Error("Invalid data");
}
function h265ParseSpsMultilayerExtension(reader) {
  const inter_view_mv_vert_constraint_flag = !!reader.next();
  return {
    inter_view_mv_vert_constraint_flag
  };
}
function h265ParseSps3dExtension(reader) {
  const iv_di_mc_enabled_flag = [];
  const iv_mv_scal_enabled_flag = [];
  iv_di_mc_enabled_flag[0] = !!reader.next();
  iv_mv_scal_enabled_flag[0] = !!reader.next();
  const log2_ivmc_sub_pb_size_minus3 = reader.decodeExponentialGolombNumber();
  const iv_res_pred_enabled_flag = !!reader.next();
  const depth_ref_enabled_flag = !!reader.next();
  const vsp_mc_enabled_flag = !!reader.next();
  const dbbp_enabled_flag = !!reader.next();
  iv_di_mc_enabled_flag[1] = !!reader.next();
  iv_mv_scal_enabled_flag[1] = !!reader.next();
  const tex_mc_enabled_flag = !!reader.next();
  const log2_texmc_sub_pb_size_minus3 = reader.decodeExponentialGolombNumber();
  const intra_contour_enabled_flag = !!reader.next();
  const intra_dc_only_wedge_enabled_flag = !!reader.next();
  const cqt_cu_part_pred_enabled_flag = !!reader.next();
  const inter_dc_only_enabled_flag = !!reader.next();
  const skip_intra_enabled_flag = !!reader.next();
  return {
    iv_di_mc_enabled_flag,
    iv_mv_scal_enabled_flag,
    log2_ivmc_sub_pb_size_minus3,
    iv_res_pred_enabled_flag,
    depth_ref_enabled_flag,
    vsp_mc_enabled_flag,
    dbbp_enabled_flag,
    tex_mc_enabled_flag,
    log2_texmc_sub_pb_size_minus3,
    intra_contour_enabled_flag,
    intra_dc_only_wedge_enabled_flag,
    cqt_cu_part_pred_enabled_flag,
    inter_dc_only_enabled_flag,
    skip_intra_enabled_flag
  };
}
function h265ParseConfiguration(data) {
  const { videoParameterSet, sequenceParameterSet, pictureParameterSet } = h265SearchConfiguration(data);
  const { profileTierLevel: { generalProfileTier: { profile_space: generalProfileSpace, tier_flag: generalTierFlag, profile_idc: generalProfileIndex, profileCompatibilitySet: generalProfileCompatibilitySet, constraintSet: generalConstraintSet }, general_level_idc: generalLevelIndex } } = h265ParseVideoParameterSet(videoParameterSet.rbsp);
  const { chroma_format_idc, pic_width_in_luma_samples: encodedWidth, pic_height_in_luma_samples: encodedHeight, conf_win_left_offset: cropLeft = 0, conf_win_right_offset: cropRight = 0, conf_win_top_offset: cropTop = 0, conf_win_bottom_offset: cropBottom = 0 } = h265ParseSequenceParameterSet(sequenceParameterSet.rbsp);
  const SubWidthC = getSubWidthC(chroma_format_idc);
  const SubHeightC = getSubHeightC(chroma_format_idc);
  const croppedWidth = encodedWidth - SubWidthC * (cropLeft + cropRight);
  const croppedHeight = encodedHeight - SubHeightC * (cropTop + cropBottom);
  return {
    videoParameterSet,
    sequenceParameterSet,
    pictureParameterSet,
    generalProfileSpace,
    generalProfileIndex,
    generalProfileCompatibilitySet,
    generalTierFlag,
    generalLevelIndex,
    generalConstraintSet,
    encodedWidth,
    encodedHeight,
    cropLeft,
    cropRight,
    cropTop,
    cropBottom,
    croppedWidth,
    croppedHeight
  };
}

// node_modules/@yume-chan/adb-scrcpy/esm/connection.js
var SCRCPY_SOCKET_NAME_PREFIX = "scrcpy";
var AdbScrcpyConnection = class {
  adb;
  options;
  socketName;
  constructor(adb, options) {
    this.adb = adb;
    this.options = options;
    this.socketName = this.getSocketName();
  }
  initialize() {
  }
  getSocketName() {
    let socketName = "localabstract:" + SCRCPY_SOCKET_NAME_PREFIX;
    if (this.options.scid !== void 0) {
      socketName += "_" + this.options.scid.padStart(8, "0");
    }
    return socketName;
  }
  dispose() {
  }
};
var AdbScrcpyForwardConnection = class extends AdbScrcpyConnection {
  #disposed = false;
  #connect() {
    return this.adb.createSocket(this.socketName);
  }
  async #connectAndRetry(sendDummyByte) {
    for (let i = 0; !this.#disposed && i < 100; i += 1) {
      try {
        const stream = await this.#connect();
        if (sendDummyByte) {
          const buffered = new BufferedReadableStream(stream.readable);
          await buffered.readExactly(1);
          return {
            readable: buffered.release(),
            writable: stream.writable
          };
        }
        return stream;
      } catch {
        await delay(100);
      }
    }
    throw new Error(`Can't connect to server after 100 retries`);
  }
  async getStreams() {
    let { sendDummyByte } = this.options;
    const streams = {};
    if (this.options.video) {
      const stream = await this.#connectAndRetry(sendDummyByte);
      streams.video = stream.readable;
      sendDummyByte = false;
    }
    if (this.options.audio) {
      const stream = await this.#connectAndRetry(sendDummyByte);
      streams.audio = stream.readable;
      sendDummyByte = false;
    }
    if (this.options.control) {
      const stream = await this.#connectAndRetry(sendDummyByte);
      streams.control = stream;
      sendDummyByte = false;
    }
    return streams;
  }
  dispose() {
    this.#disposed = true;
  }
};
var AdbScrcpyReverseConnection = class extends AdbScrcpyConnection {
  #streams;
  #address;
  async initialize() {
    await this.adb.reverse.remove(this.socketName).catch((e) => {
      if (e instanceof AdbReverseNotSupportedError) {
        throw e;
      }
    });
    let queueController;
    const queue = new PushReadableStream((controller) => {
      queueController = controller;
    });
    this.#streams = queue.getReader();
    this.#address = await this.adb.reverse.add(this.socketName, async (socket) => {
      await queueController.enqueue(socket);
    });
  }
  async #accept() {
    return (await this.#streams.read()).value;
  }
  async getStreams() {
    const streams = {};
    if (this.options.video) {
      const stream = await this.#accept();
      streams.video = stream.readable;
    }
    if (this.options.audio) {
      const stream = await this.#accept();
      streams.audio = stream.readable;
    }
    if (this.options.control) {
      const stream = await this.#accept();
      streams.control = stream;
    }
    return streams;
  }
  dispose() {
    this.adb.reverse.remove(this.#address).catch(NOOP2);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/video.js
var AdbScrcpyVideoStream = class {
  #options;
  #metadata;
  get metadata() {
    return this.#metadata;
  }
  #stream;
  get stream() {
    return this.#stream;
  }
  #sizeChanged = new StickyEventEmitter();
  get sizeChanged() {
    return this.#sizeChanged.event;
  }
  #width = 0;
  get width() {
    return this.#width;
  }
  #height = 0;
  get height() {
    return this.#height;
  }
  constructor(options, metadata, stream) {
    this.#options = options;
    this.#metadata = metadata;
    this.#stream = stream.pipeThrough(this.#options.createMediaStreamTransformer()).pipeThrough(new InspectStream((packet) => {
      if (packet.type === "configuration") {
        switch (metadata.codec) {
          case ScrcpyVideoCodecId.H264:
            this.#configureH264(packet.data);
            break;
          case ScrcpyVideoCodecId.H265:
            this.#configureH265(packet.data);
            break;
          case ScrcpyVideoCodecId.AV1:
            break;
        }
      } else if (metadata.codec === ScrcpyVideoCodecId.AV1) {
        this.#configureAv1(packet.data);
      }
    }));
  }
  #configureH264(data) {
    const { croppedWidth, croppedHeight } = h264ParseConfiguration(data);
    this.#width = croppedWidth;
    this.#height = croppedHeight;
    this.#sizeChanged.fire({ width: croppedWidth, height: croppedHeight });
  }
  #configureH265(data) {
    const { croppedWidth, croppedHeight } = h265ParseConfiguration(data);
    this.#width = croppedWidth;
    this.#height = croppedHeight;
    this.#sizeChanged.fire({ width: croppedWidth, height: croppedHeight });
  }
  #configureAv1(data) {
    const parser = new Av1(data);
    const sequenceHeader = parser.searchSequenceHeaderObu();
    if (!sequenceHeader) {
      return;
    }
    const { max_frame_width_minus_1, max_frame_height_minus_1 } = sequenceHeader;
    const width = max_frame_width_minus_1 + 1;
    const height = max_frame_height_minus_1 + 1;
    this.#width = width;
    this.#height = height;
    this.#sizeChanged.fire({ width, height });
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/client.js
function arrayToStream(array) {
  return new PushReadableStream(async (controller) => {
    for (const item of array) {
      await controller.enqueue(item);
    }
  });
}
function concatStreams(...streams) {
  return new PushReadableStream(async (controller) => {
    for (const stream of streams) {
      const reader = stream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        await controller.enqueue(value);
      }
    }
  });
}
var AdbScrcpyExitedError = class extends Error {
  output;
  constructor(output) {
    super("scrcpy server exited prematurely");
    this.output = output;
  }
};
var AdbScrcpyClient = class _AdbScrcpyClient {
  static async pushServer(adb, file, filename = DefaultServerPath) {
    const sync = await adb.sync();
    try {
      await sync.write({
        filename,
        file
      });
    } finally {
      await sync.dispose();
    }
  }
  static async start(adb, path, options) {
    let connection;
    let process;
    try {
      try {
        connection = options.createConnection(adb);
        await connection.initialize();
      } catch (e) {
        if (e instanceof AdbReverseNotSupportedError) {
          options.value.tunnelForward = true;
          connection = options.createConnection(adb);
          await connection.initialize();
        } else {
          connection = void 0;
          throw e;
        }
      }
      const args = [
        `CLASSPATH=${path}`,
        // Set environment variable
        "app_process",
        "/",
        // Parent dir (unused but required)
        "com.genymobile.scrcpy.Server",
        options.version,
        ...options.serialize()
      ];
      if (options.spawner) {
        process = await options.spawner.spawn(args);
      } else {
        process = await adb.subprocess.noneProtocol.spawn(args);
      }
      const output = process.output.pipeThrough(new TextDecoderStream()).pipeThrough(new SplitStringStream("\n"));
      const lines = [];
      const abortController = new AbortController();
      const pipe = output.pipeTo(new WritableStream({
        write(chunk) {
          lines.push(chunk);
        }
      }), {
        signal: abortController.signal,
        preventCancel: true
      }).catch((e) => {
        if (abortController.signal.aborted) {
          return;
        }
        throw e;
      });
      const streams = await Promise.race([
        process.exited.then(() => {
          throw new AdbScrcpyExitedError(lines);
        }),
        connection.getStreams()
      ]);
      abortController.abort();
      await pipe;
      return new _AdbScrcpyClient({
        options,
        process,
        output: concatStreams(arrayToStream(lines), output),
        videoStream: streams.video,
        audioStream: streams.audio,
        controlStream: streams.control
      });
    } catch (e) {
      await process?.kill();
      throw e;
    } finally {
      connection?.dispose();
    }
  }
  /**
   * This method will modify the given `options`,
   * so don't reuse it elsewhere.
   */
  static getEncoders(adb, path, options) {
    options.setListEncoders();
    return options.getEncoders(adb, path);
  }
  /**
   * This method will modify the given `options`,
   * so don't reuse it elsewhere.
   */
  static getDisplays(adb, path, options) {
    options.setListDisplays();
    return options.getDisplays(adb, path);
  }
  #options;
  #process;
  #output;
  get output() {
    return this.#output;
  }
  get exited() {
    return this.#process.exited;
  }
  #videoStream;
  /**
   * Gets a `Promise` that resolves to the parsed video stream.
   *
   * On server version 2.1 and above, it will be `undefined` if
   * video is disabled by `options.video: false`.
   *
   * Note: if it's not `undefined`, it must be consumed to prevent
   * the connection from being blocked.
   */
  get videoStream() {
    return this.#videoStream;
  }
  #audioStream;
  /**
   * Gets a `Promise` that resolves to the parsed audio stream.
   *
   * On server versions before 2.0, it will always be `undefined`.
   * On server version 2.0 and above, it will be `undefined` if
   * audio is disabled by `options.audio: false`.
   *
   * Note: if it's not `undefined`, it must be consumed to prevent
   * the connection from being blocked.
   */
  get audioStream() {
    return this.#audioStream;
  }
  #controller;
  /**
   * Gets the control message writer.
   *
   * On server version 1.22 and above, it will be `undefined` if
   * control is disabled by `options.control: false`.
   */
  get controller() {
    return this.#controller;
  }
  get clipboard() {
    return this.#options.clipboard;
  }
  constructor({ options, process, output, videoStream, audioStream, controlStream }) {
    this.#options = options;
    this.#process = process;
    this.#output = output;
    this.#videoStream = videoStream ? this.#createVideoStream(videoStream) : void 0;
    this.#audioStream = audioStream ? this.#createAudioStream(audioStream) : void 0;
    if (controlStream) {
      this.#controller = new ScrcpyControlMessageWriter(controlStream.writable.getWriter(), options);
      this.#parseDeviceMessages(controlStream.readable).catch(() => {
      });
    }
  }
  async #parseDeviceMessages(controlStream) {
    const buffered = new BufferedReadableStream(controlStream);
    try {
      while (true) {
        let id;
        try {
          const result = await buffered.readExactly(1);
          id = result[0];
        } catch (e) {
          if (e instanceof ExactReadableEndedError) {
            this.#options.deviceMessageParsers.close();
            break;
          }
          throw e;
        }
        await this.#options.deviceMessageParsers.parse(id, buffered);
      }
    } catch (e) {
      this.#options.deviceMessageParsers.error(e);
      await tryCancel(buffered);
    }
  }
  async #createVideoStream(initialStream) {
    const { metadata, stream } = await this.#options.parseVideoStreamMetadata(initialStream);
    return new AdbScrcpyVideoStream(this.#options, metadata, stream);
  }
  async #createAudioStream(initialStream) {
    if (!this.#options.parseAudioStreamMetadata) {
      throw new Error("parsing audio stream is not supported in this version");
    }
    const metadata = await this.#options.parseAudioStreamMetadata(initialStream);
    switch (metadata.type) {
      case "disabled":
      case "errored":
        return metadata;
      case "success":
        return {
          ...metadata,
          stream: metadata.stream.pipeThrough(this.#options.createMediaStreamTransformer())
        };
      default:
        throw new Error(`Unexpected audio metadata type ${metadata["type"]}`);
    }
  }
  async close() {
    await this.#process.kill();
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/1_15/impl/get-displays.js
async function getDisplays(adb, path, options) {
  try {
    const client = await AdbScrcpyClient.start(adb, path, options);
    await client.close();
    throw new Error("Unexpected server output");
  } catch (e) {
    if (e instanceof AdbScrcpyExitedError) {
      if (e.output[0]?.startsWith("[server] ERROR:")) {
        throw e;
      }
      const displays = [];
      for (const line of e.output) {
        const display = options.parseDisplay(line);
        if (display) {
          displays.push(display);
        }
      }
      return displays;
    }
    throw e;
  }
}

// node_modules/@yume-chan/adb-scrcpy/esm/2_0/impl/get-encoders.js
async function getEncoders(adb, path, options) {
  try {
    const client = await AdbScrcpyClient.start(adb, path, options);
    await client.close();
    throw new Error("Unexpected server output");
  } catch (e) {
    if (e instanceof AdbScrcpyExitedError) {
      if (e.output[0]?.startsWith("[server] ERROR:")) {
        throw e;
      }
      const encoders = [];
      for (const line of e.output) {
        const encoder = options.parseEncoder(line);
        if (encoder) {
          encoders.push(encoder);
        }
      }
      return encoders;
    }
    throw e;
  }
}

// node_modules/@yume-chan/adb-scrcpy/esm/2_1/impl/create-connection.js
function createConnection(adb, options) {
  const connectionOptions = {
    scid: toScrcpyOptionValue(options.scid, void 0),
    video: options.video,
    audio: options.audio,
    control: options.control,
    sendDummyByte: options.sendDummyByte
  };
  if (options.tunnelForward) {
    return new AdbScrcpyForwardConnection(adb, connectionOptions);
  } else {
    return new AdbScrcpyReverseConnection(adb, connectionOptions);
  }
}

// node_modules/@yume-chan/adb-scrcpy/esm/2_1/options.js
var AdbScrcpyOptions2_1 = class extends ScrcpyOptions2_1 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "2.1";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/2_3.js
var AdbScrcpyOptions2_3 = class extends ScrcpyOptions2_3 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "2.3";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/2_4.js
var AdbScrcpyOptions2_4 = class extends ScrcpyOptions2_4 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "2.4";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/2_7.js
var AdbScrcpyOptions2_7 = class extends ScrcpyOptions2_7 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "2.7";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/3_0_2.js
var AdbScrcpyOptions3_0_2 = class extends ScrcpyOptions3_0_2 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "3.0.2";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection(adb, this.value);
  }
};

// node_modules/@yume-chan/adb-scrcpy/esm/3_1.js
var AdbScrcpyOptions3_1 = class extends ScrcpyOptions3_1 {
  version;
  spawner;
  constructor(init, clientOptions) {
    super(init);
    this.version = clientOptions?.version ?? "3.1";
    this.spawner = clientOptions?.spawner;
  }
  getEncoders(adb, path) {
    return getEncoders(adb, path, this);
  }
  getDisplays(adb, path) {
    return getDisplays(adb, path, this);
  }
  createConnection(adb) {
    return createConnection(adb, this.value);
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/codec/utils.js
function hexDigits(value) {
  return value.toString(16).toUpperCase();
}
function hexTwoDigits(value) {
  return value.toString(16).toUpperCase().padStart(2, "0");
}
function decimalTwoDigits(value) {
  return value.toString(10).padStart(2, "0");
}

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/codec/av1.js
var Av1Codec = class {
  #decoder;
  #updateSize;
  #options;
  #config;
  #configured = false;
  constructor(decoder, updateSize, options) {
    this.#decoder = decoder;
    this.#updateSize = updateSize;
    this.#options = options;
  }
  #parseConfig(data) {
    const parser = new Av1(data);
    const sequenceHeader = parser.searchSequenceHeaderObu();
    if (!sequenceHeader) {
      return;
    }
    const { seq_profile: seqProfile, seq_level_idx: [seqLevelIdx = 0], max_frame_width_minus_1, max_frame_height_minus_1, color_config: { BitDepth, mono_chrome: monoChrome, subsampling_x: subsamplingX, subsampling_y: subsamplingY, chroma_sample_position: chromaSamplePosition, color_description_present_flag } } = sequenceHeader;
    let colorPrimaries;
    let transferCharacteristics;
    let matrixCoefficients;
    let colorRange;
    if (color_description_present_flag) {
      ({
        color_primaries: colorPrimaries,
        transfer_characteristics: transferCharacteristics,
        matrix_coefficients: matrixCoefficients,
        color_range: colorRange
      } = sequenceHeader.color_config);
    } else {
      colorPrimaries = Av1.ColorPrimaries.Bt709;
      transferCharacteristics = Av1.TransferCharacteristics.Bt709;
      matrixCoefficients = Av1.MatrixCoefficients.Bt709;
      colorRange = false;
    }
    const width = max_frame_width_minus_1 + 1;
    const height = max_frame_height_minus_1 + 1;
    this.#updateSize(width, height);
    const codec = [
      "av01",
      seqProfile.toString(16),
      decimalTwoDigits(seqLevelIdx) + (sequenceHeader.seq_tier[0] ? "H" : "M"),
      decimalTwoDigits(BitDepth),
      monoChrome ? "1" : "0",
      (subsamplingX ? "1" : "0") + (subsamplingY ? "1" : "0") + chromaSamplePosition.toString(),
      decimalTwoDigits(colorPrimaries),
      decimalTwoDigits(transferCharacteristics),
      decimalTwoDigits(matrixCoefficients),
      colorRange ? "1" : "0"
    ].join(".");
    this.#config = {
      codec,
      hardwareAcceleration: this.#options?.hardwareAcceleration ?? "no-preference",
      optimizeForLatency: true
    };
    this.#configured = false;
  }
  decode(packet) {
    if (packet.type === "configuration") {
      return;
    }
    this.#parseConfig(packet.data);
    if (!this.#config) {
      throw new Error("Decoder not configured");
    }
    if (packet.keyframe) {
      if (this.#decoder.decodeQueueSize) {
        this.#decoder.reset();
        this.#decoder.configure(this.#config);
        this.#configured = true;
      } else if (!this.#configured) {
        this.#decoder.configure(this.#config);
        this.#configured = true;
      }
    }
    this.#decoder.decode(new EncodedVideoChunk({
      // AV1 requires Scrcpy 2.0 where `keyframe` flag must be set
      type: packet.keyframe ? "key" : "delta",
      timestamp: 0,
      data: packet.data
    }));
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/codec/h26x.js
var H26xDecoder = class {
  #decoder;
  #config;
  #configured = false;
  constructor(decoder) {
    this.#decoder = decoder;
  }
  #configureAndDecodeFirstKeyframe(config, packet) {
    this.#decoder.configure(config);
    this.#configured = true;
    const { raw } = config;
    const data = new Uint8Array(raw.length + packet.data.length);
    data.set(raw, 0);
    data.set(packet.data, raw.length);
    this.#decoder.decode(new EncodedVideoChunk({
      type: "key",
      timestamp: 0,
      data
    }));
  }
  decode(packet) {
    if (packet.type === "configuration") {
      this.#config = {
        ...this.configure(packet.data),
        raw: packet.data
      };
      this.#configured = false;
      return;
    }
    if (!this.#config) {
      throw new Error("Decoder not configured");
    }
    if (packet.keyframe) {
      if (this.#decoder.decodeQueueSize) {
        this.#decoder.reset();
        this.#configureAndDecodeFirstKeyframe(this.#config, packet);
        return;
      }
      if (!this.#configured) {
        this.#configureAndDecodeFirstKeyframe(this.#config, packet);
        return;
      }
    }
    if (!this.#configured) {
      if (packet.keyframe === void 0) {
        this.#configureAndDecodeFirstKeyframe(this.#config, packet);
        return;
      }
      throw new Error("Expect a keyframe but got a delta frame");
    }
    this.#decoder.decode(new EncodedVideoChunk({
      // Treat `undefined` as `key`, otherwise won't decode.
      type: packet.keyframe === false ? "delta" : "key",
      timestamp: 0,
      data: packet.data
    }));
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/codec/h264.js
var H264Decoder = class extends H26xDecoder {
  #updateSize;
  #options;
  constructor(decoder, updateSize, options) {
    super(decoder);
    this.#updateSize = updateSize;
    this.#options = options;
  }
  configure(data) {
    const { profileIndex, constraintSet, levelIndex, croppedWidth, croppedHeight } = h264ParseConfiguration(data);
    this.#updateSize(croppedWidth, croppedHeight);
    const codec = "avc1." + hexTwoDigits(profileIndex) + hexTwoDigits(constraintSet) + hexTwoDigits(levelIndex);
    return {
      codec,
      hardwareAcceleration: this.#options?.hardwareAcceleration ?? "no-preference",
      optimizeForLatency: true
    };
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/codec/h265.js
var H265Decoder = class extends H26xDecoder {
  #updateSize;
  #options;
  constructor(decoder, updateSize, options) {
    super(decoder);
    this.#updateSize = updateSize;
    this.#options = options;
  }
  configure(data) {
    const { generalProfileSpace, generalProfileIndex, generalProfileCompatibilitySet, generalTierFlag, generalLevelIndex, generalConstraintSet, croppedWidth, croppedHeight } = h265ParseConfiguration(data);
    this.#updateSize(croppedWidth, croppedHeight);
    const codec = [
      "hev1",
      ["", "A", "B", "C"][generalProfileSpace] + generalProfileIndex.toString(),
      hexDigits(getUint32LittleEndian(generalProfileCompatibilitySet, 0)),
      (generalTierFlag ? "H" : "L") + generalLevelIndex.toString(),
      ...Array.from(generalConstraintSet, hexDigits)
    ].join(".");
    return {
      codec,
      // Microsoft Edge requires explicit size to work
      codedWidth: croppedWidth,
      codedHeight: croppedHeight,
      hardwareAcceleration: this.#options?.hardwareAcceleration ?? "no-preference",
      optimizeForLatency: true
    };
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/pool.js
var Pool = class {
  #controller;
  #readable = new ReadableStream({
    start: (controller) => {
      this.#controller = controller;
    },
    pull: (controller) => {
      controller.enqueue(this.#initializer());
    }
  }, { highWaterMark: 0 });
  #reader = this.#readable.getReader();
  #initializer;
  #size = 0;
  #capacity;
  constructor(initializer, capacity) {
    this.#initializer = initializer;
    this.#capacity = capacity;
  }
  async borrow() {
    const result = await this.#reader.read();
    return result.value;
  }
  return(value) {
    if (this.#size < this.#capacity) {
      this.#controller.enqueue(value);
      this.#size += 1;
    }
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/snapshot.js
var VideoFrameCapturer = class {
  #canvas;
  #context;
  constructor() {
    if (typeof OffscreenCanvas !== "undefined") {
      this.#canvas = new OffscreenCanvas(1, 1);
    } else {
      this.#canvas = document.createElement("canvas");
      this.#canvas.width = 1;
      this.#canvas.height = 1;
    }
    this.#context = this.#canvas.getContext("bitmaprenderer", {
      alpha: false
    });
  }
  async capture(frame) {
    this.#canvas.width = frame.displayWidth;
    this.#canvas.height = frame.displayHeight;
    const bitmap = await createImageBitmap(frame);
    this.#context.transferFromImageBitmap(bitmap);
    if (this.#canvas instanceof OffscreenCanvas) {
      return await this.#canvas.convertToBlob({
        type: "image/png"
      });
    } else {
      return new Promise((resolve, reject) => {
        this.#canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to convert canvas to blob"));
          } else {
            resolve(blob);
          }
        }, "image/png");
      });
    }
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/decoder.js
var VideoFrameCapturerPool = /* @__PURE__ */ new Pool(() => new VideoFrameCapturer(), 4);
var WebCodecsVideoDecoder = class {
  static get isSupported() {
    return typeof globalThis.VideoDecoder !== "undefined";
  }
  static capabilities = {
    h264: {},
    h265: {},
    av1: {}
  };
  #codec;
  get codec() {
    return this.#codec;
  }
  #renderer;
  get renderer() {
    return this.#renderer;
  }
  #options;
  #codecDecoder;
  #writable;
  get writable() {
    return this.#writable;
  }
  #error;
  #controller;
  #framesDraw = 0;
  #framesPresented = 0;
  get framesRendered() {
    return this.#framesPresented;
  }
  #framesSkipped = 0;
  get framesSkipped() {
    return this.#framesSkipped;
  }
  #sizeChanged = new StickyEventEmitter();
  get sizeChanged() {
    return this.#sizeChanged.event;
  }
  #width = 0;
  get width() {
    return this.#width;
  }
  #height = 0;
  get height() {
    return this.#height;
  }
  #decoder;
  #drawing = false;
  #nextFrame;
  #captureFrame;
  #animationFrameId = 0;
  /**
   * Create a new WebCodecs video decoder.
   */
  constructor({ codec, renderer, ...options }) {
    this.#codec = codec;
    this.#renderer = renderer;
    this.#options = options;
    this.#decoder = new VideoDecoder({
      output: (frame) => {
        this.#captureFrame?.close();
        this.#captureFrame = frame.clone();
        if (this.#drawing) {
          if (this.#nextFrame) {
            this.#nextFrame.close();
            this.#framesSkipped += 1;
          }
          this.#nextFrame = frame;
          return;
        }
        void this.#draw(frame);
      },
      error: (error) => {
        this.#setError(error);
      }
    });
    switch (this.#codec) {
      case ScrcpyVideoCodecId.H264:
        this.#codecDecoder = new H264Decoder(this.#decoder, this.#updateSize, this.#options);
        break;
      case ScrcpyVideoCodecId.H265:
        this.#codecDecoder = new H265Decoder(this.#decoder, this.#updateSize, this.#options);
        break;
      case ScrcpyVideoCodecId.AV1:
        this.#codecDecoder = new Av1Codec(this.#decoder, this.#updateSize, this.#options);
        break;
      default:
        throw new Error(`Unsupported codec: ${this.#codec}`);
    }
    this.#writable = new WritableStream({
      start: (controller) => {
        if (this.#error) {
          controller.error(this.#error);
        } else {
          this.#controller = controller;
        }
      },
      write: (packet) => {
        this.#codecDecoder.decode(packet);
      }
    });
    this.#handleAnimationFrame();
  }
  #setError(error) {
    if (this.#controller) {
      try {
        this.#controller.error(error);
      } catch {
      }
    } else {
      this.#error = error;
    }
  }
  async #draw(frame) {
    try {
      this.#drawing = true;
      this.#updateSize(frame.displayWidth, frame.displayHeight);
      await this.#renderer.draw(frame);
      this.#framesDraw += 1;
      frame.close();
      if (this.#nextFrame) {
        const frame2 = this.#nextFrame;
        this.#nextFrame = void 0;
        await this.#draw(frame2);
      }
      this.#drawing = false;
    } catch (error) {
      this.#setError(error);
    }
  }
  #updateSize = (width, height) => {
    this.#renderer.setSize(width, height);
    this.#width = width;
    this.#height = height;
    this.#sizeChanged.fire({ width, height });
  };
  #handleAnimationFrame = () => {
    if (this.#framesDraw > 0) {
      this.#framesPresented += 1;
      this.#framesSkipped += this.#framesDraw - 1;
      this.#framesDraw = 0;
    }
    this.#animationFrameId = requestAnimationFrame(this.#handleAnimationFrame);
  };
  async snapshot() {
    const frame = this.#captureFrame;
    if (!frame) {
      return void 0;
    }
    const capturer = await VideoFrameCapturerPool.borrow();
    const result = await capturer.capture(frame);
    VideoFrameCapturerPool.return(capturer);
    return result;
  }
  dispose() {
    cancelAnimationFrame(this.#animationFrameId);
    if (this.#decoder.state !== "closed") {
      this.#decoder.close();
    }
    this.#nextFrame?.close();
    this.#captureFrame?.close();
  }
};

// node_modules/@yume-chan/scrcpy-decoder-tinyh264/esm/decoder.js
var import_yuv_buffer = __toESM(require_yuv_buffer(), 1);
var import_yuv_canvas = __toESM(require_yuv_canvas(), 1);

// node_modules/@yume-chan/scrcpy-decoder-tinyh264/esm/wrapper.js
var worker;
var workerReady = false;
var pendingResolvers = [];
var streamId = 0;
var PICTURE_READY_SUBSCRIPTIONS = /* @__PURE__ */ new Map();
function subscribePictureReady(streamId2, handler) {
  PICTURE_READY_SUBSCRIPTIONS.set(streamId2, handler);
  return {
    dispose() {
      PICTURE_READY_SUBSCRIPTIONS.delete(streamId2);
    }
  };
}
var TinyH264Wrapper = class extends AutoDisposable {
  streamId;
  #pictureReadyEvent = new EventEmitter();
  get onPictureReady() {
    return this.#pictureReadyEvent.event;
  }
  constructor(streamId2) {
    super();
    this.streamId = streamId2;
    this.addDisposable(subscribePictureReady(streamId2, this.#handlePictureReady));
  }
  #handlePictureReady = (e) => {
    this.#pictureReadyEvent.fire(e);
  };
  feed(data) {
    worker.postMessage({
      type: "decode",
      data,
      offset: 0,
      length: data.byteLength,
      renderStateId: this.streamId
    }, [data]);
  }
  dispose() {
    super.dispose();
    worker.postMessage({
      type: "release",
      renderStateId: this.streamId
    });
  }
};
function createTinyH264Wrapper() {
  if (!worker) {
    worker = null;
    worker.addEventListener("message", ({ data }) => {
      switch (data.type) {
        case "decoderReady":
          workerReady = true;
          for (const resolver of pendingResolvers) {
            resolver.resolve(new TinyH264Wrapper(streamId));
            streamId += 1;
          }
          pendingResolvers.length = 0;
          break;
        case "pictureReady":
          PICTURE_READY_SUBSCRIPTIONS.get(data.renderStateId)?.(data);
          break;
      }
    });
  }
  if (!workerReady) {
    const resolver = new PromiseResolver();
    pendingResolvers.push(resolver);
    return resolver.promise;
  }
  const decoder = new TinyH264Wrapper(streamId);
  streamId += 1;
  return Promise.resolve(decoder);
}

// node_modules/@yume-chan/scrcpy-decoder-tinyh264/esm/decoder.js
var noop = () => {
};
function createCanvas() {
  if (typeof document !== "undefined") {
    return document.createElement("canvas");
  }
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(1, 1);
  }
  throw new Error("no canvas input found nor any canvas can be created");
}
var TinyH264Decoder = class {
  static capabilities = {
    h264: {
      maxProfile: AndroidAvcProfile.Baseline,
      maxLevel: AndroidAvcLevel.Level4
    }
  };
  #renderer;
  get renderer() {
    return this.#renderer;
  }
  #sizeChanged = new StickyEventEmitter();
  get sizeChanged() {
    return this.#sizeChanged.event;
  }
  #width = 0;
  get width() {
    return this.#width;
  }
  #height = 0;
  get height() {
    return this.#height;
  }
  #frameRendered = 0;
  get framesRendered() {
    return this.#frameRendered;
  }
  #frameSkipped = 0;
  get framesSkipped() {
    return this.#frameSkipped;
  }
  #writable;
  get writable() {
    return this.#writable;
  }
  #yuvCanvas;
  #initializer;
  constructor({ canvas } = {}) {
    if (canvas) {
      this.#renderer = canvas;
    } else {
      this.#renderer = createCanvas();
    }
    this.#writable = new WritableStream({
      write: async (packet) => {
        switch (packet.type) {
          case "configuration":
            await this.#configure(packet.data);
            break;
          case "data": {
            if (!this.#initializer) {
              throw new Error("Decoder not configured");
            }
            const wrapper = await this.#initializer.promise;
            wrapper.feed(packet.data.slice().buffer);
            break;
          }
        }
      }
    });
  }
  async #configure(data) {
    this.dispose();
    this.#initializer = new PromiseResolver();
    if (!this.#yuvCanvas) {
      const canvas = createCanvas();
      const attributes = {
        // Disallow software rendering.
        // Other rendering methods are faster than software-based WebGL.
        failIfMajorPerformanceCaveat: true
      };
      const gl = canvas.getContext("webgl2", attributes) || canvas.getContext("webgl", attributes);
      this.#yuvCanvas = import_yuv_canvas.default.attach(this.#renderer, {
        webGL: !!gl
      });
    }
    const { encodedWidth, encodedHeight, croppedWidth, croppedHeight, cropLeft, cropTop } = h264ParseConfiguration(data);
    this.#width = croppedWidth;
    this.#height = croppedHeight;
    this.#sizeChanged.fire({
      width: croppedWidth,
      height: croppedHeight
    });
    const chromaWidth = encodedWidth / 2;
    const chromaHeight = encodedHeight / 2;
    const format = import_yuv_buffer.default.format({
      width: encodedWidth,
      height: encodedHeight,
      chromaWidth,
      chromaHeight,
      cropLeft,
      cropTop,
      cropWidth: croppedWidth,
      cropHeight: croppedHeight,
      displayWidth: croppedWidth,
      displayHeight: croppedHeight
    });
    const wrapper = await createTinyH264Wrapper();
    this.#initializer.resolve(wrapper);
    const uPlaneOffset = encodedWidth * encodedHeight;
    const vPlaneOffset = uPlaneOffset + chromaWidth * chromaHeight;
    wrapper.onPictureReady(({ data: data2 }) => {
      this.#frameRendered += 1;
      const array = new Uint8Array(data2);
      const frame = import_yuv_buffer.default.frame(format, import_yuv_buffer.default.lumaPlane(format, array, encodedWidth, 0), import_yuv_buffer.default.chromaPlane(format, array, chromaWidth, uPlaneOffset), import_yuv_buffer.default.chromaPlane(format, array, chromaWidth, vPlaneOffset));
      this.#yuvCanvas.drawFrame(frame);
    });
    wrapper.feed(data.slice().buffer);
  }
  dispose() {
    this.#initializer?.promise.then((wrapper) => wrapper.dispose()).catch(noop);
    this.#initializer = void 0;
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/render/canvas.js
var CanvasVideoFrameRenderer = class {
  #canvas;
  get canvas() {
    return this.#canvas;
  }
  constructor(canvas) {
    if (canvas) {
      this.#canvas = canvas;
    } else {
      this.#canvas = createCanvas();
    }
  }
  setSize(width, height) {
    if (this.#canvas.width !== width || this.#canvas.height !== height) {
      this.#canvas.width = width;
      this.#canvas.height = height;
    }
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/render/bitmap.js
var BitmapVideoFrameRenderer = class extends CanvasVideoFrameRenderer {
  #context;
  constructor(canvas) {
    super(canvas);
    this.#context = this.canvas.getContext("bitmaprenderer", {
      alpha: false
    });
  }
  async draw(frame) {
    const bitmap = await createImageBitmap(frame);
    this.#context.transferFromImageBitmap(bitmap);
  }
};

// node_modules/@yume-chan/scrcpy-decoder-webcodecs/esm/video/render/webgl.js
var Resolved = Promise.resolve();
function createContext(canvas, enableCapture) {
  const attributes = {
    // Low-power GPU should be enough for video rendering.
    powerPreference: "low-power",
    alpha: false,
    // Disallow software rendering.
    // Other rendering methods are faster than software-based WebGL.
    failIfMajorPerformanceCaveat: true,
    preserveDrawingBuffer: !!enableCapture
  };
  return canvas.getContext("webgl2", attributes) || canvas.getContext("webgl", attributes);
}
var WebGLVideoFrameRenderer = class _WebGLVideoFrameRenderer extends CanvasVideoFrameRenderer {
  static vertexShaderSource = `
        attribute vec2 xy;

        varying highp vec2 uv;

        void main(void) {
            gl_Position = vec4(xy, 0.0, 1.0);
            // Map vertex coordinates (-1 to +1) to UV coordinates (0 to 1).
            // UV coordinates are Y-flipped relative to vertex coordinates.
            uv = vec2((1.0 + xy.x) / 2.0, (1.0 - xy.y) / 2.0);
        }
`;
  static fragmentShaderSource = `
        varying highp vec2 uv;

        uniform sampler2D texture;

        void main(void) {
            gl_FragColor = texture2D(texture, uv);
        }
`;
  static get isSupported() {
    const canvas = createCanvas();
    return !!createContext(canvas);
  }
  #context;
  /**
   * Create a new WebGL frame renderer.
   * @param canvas The canvas to render frames to.
   * @param enableCapture
   * Whether to allow capturing the canvas content using APIs like `readPixels` and `toDataURL`.
   * Enable this option may reduce performance.
   */
  constructor(canvas, enableCapture) {
    super(canvas);
    const gl = createContext(this.canvas, enableCapture);
    if (!gl) {
      throw new Error("WebGL not supported");
    }
    this.#context = gl;
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, _WebGLVideoFrameRenderer.vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(vertexShader));
    }
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, _WebGLVideoFrameRenderer.fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(fragmentShader));
    }
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(shaderProgram));
    }
    gl.useProgram(shaderProgram);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const xyLocation = gl.getAttribLocation(shaderProgram, "xy");
    gl.vertexAttribPointer(xyLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(xyLocation);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  draw(frame) {
    const gl = this.#context;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, frame);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    return Resolved;
  }
};

// src/embedded-servers.ts
function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
var RAW_SERVERS = {
  "v3.1": "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",
  "v3.0.2": "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",
  "v2.7": "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",
  "v2.4": "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",
  "v2.3": "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",
  "v2.1": "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"
};
var EMBEDDED_SCRCPY_SERVERS = {};
for (const [version, b64] of Object.entries(RAW_SERVERS)) {
  try {
    EMBEDDED_SCRCPY_SERVERS[version] = base64ToUint8Array(b64);
  } catch (e) {
    console.error("Failed to decode embedded server", version, e);
  }
}
export {
  Adb,
  AdbDaemonTransport,
  AdbDaemonWebUsbDeviceManager,
  AdbScrcpyClient,
  AdbScrcpyOptions2_1,
  AdbScrcpyOptions2_3,
  AdbScrcpyOptions2_4,
  AdbScrcpyOptions2_7,
  AdbScrcpyOptions3_0_2,
  AdbScrcpyOptions3_1,
  AdbWebCredentialStore,
  AndroidKeyEventAction,
  AndroidKeyEventMeta,
  AndroidMotionEventAction,
  AndroidMotionEventButton,
  BitmapVideoFrameRenderer,
  Consumable,
  DefaultServerPath,
  EMBEDDED_SCRCPY_SERVERS,
  PushReadableStream,
  ScrcpyAudioCodec,
  PointerId as ScrcpyPointerId,
  ScrcpyVideoCodecId,
  WebCodecsVideoDecoder,
  WebGLVideoFrameRenderer,
  WrapReadableStream
};
/*! Bundled license information:

yuv-canvas/src/depower.js:
  (**
   * Convert a ratio into a bit-shift count; for instance a ratio of 2
   * becomes a bit-shift of 1, while a ratio of 1 is a bit-shift of 0.
   *
   * @author Brooke Vibber <bvibber@pobox.com>
   * @copyright 2016-2024
   * @license MIT-style
   *
   * @param {number} ratio - the integer ratio to convert.
   * @returns {number} - number of bits to shift to multiply/divide by the ratio.
   * @throws exception if given a non-power-of-two
   *)

yuv-canvas/src/YCbCr.js:
  (**
   * Basic YCbCr->RGB conversion
   *
   * @author Brooke Vibber <bvibber@pobox.com>
   * @copyright 2014-2024
   * @license MIT-style
   *
   * @param {YUVFrame} buffer - input frame buffer
   * @param {Uint8ClampedArray} output - array to draw RGBA into
   * Assumes that the output array already has alpha channel set to opaque.
   *)
*/