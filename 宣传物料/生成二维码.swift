import AppKit
import CoreImage
import Foundation

let target = "https://lynch715.github.io/kaige-film-company/"
let outputPath = CommandLine.arguments.count > 1
  ? CommandLine.arguments[1]
  : "开个影视公司-Pages二维码.png"

guard let filter = CIFilter(name: "CIQRCodeGenerator") else {
  fatalError("无法创建二维码滤镜")
}
filter.setValue(Data(target.utf8), forKey: "inputMessage")
filter.setValue("H", forKey: "inputCorrectionLevel")

guard let code = filter.outputImage else {
  fatalError("二维码生成失败")
}

let canvasSize = 800
let modules = Int(code.extent.width)
let scale = max(1, canvasSize / (modules + 8))
let codeSize = modules * scale
let padding = (canvasSize - codeSize) / 2
let scaled = code.transformed(by: CGAffineTransform(scaleX: CGFloat(scale), y: CGFloat(scale)))

let colorSpace = CGColorSpaceCreateDeviceRGB()
guard let context = CGContext(
  data: nil,
  width: canvasSize,
  height: canvasSize,
  bitsPerComponent: 8,
  bytesPerRow: canvasSize * 4,
  space: colorSpace,
  bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
) else {
  fatalError("无法创建画布")
}

context.setFillColor(NSColor.white.cgColor)
context.fill(CGRect(x: 0, y: 0, width: canvasSize, height: canvasSize))
let ciContext = CIContext(options: [.useSoftwareRenderer: false])
guard let cgCode = ciContext.createCGImage(scaled, from: scaled.extent) else {
  fatalError("无法渲染二维码")
}
context.interpolationQuality = .none
context.draw(cgCode, in: CGRect(x: padding, y: padding, width: codeSize, height: codeSize))

guard let result = context.makeImage() else {
  fatalError("无法导出二维码")
}
let bitmap = NSBitmapImageRep(cgImage: result)
guard let png = bitmap.representation(using: .png, properties: [:]) else {
  fatalError("无法编码 PNG")
}
try png.write(to: URL(fileURLWithPath: outputPath))
print(target)

