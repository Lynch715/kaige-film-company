import Foundation
import Vision

guard CommandLine.arguments.count >= 2 else {
  fputs("用法：swift 验证二维码.swift <图片> [期望链接]\n", stderr)
  exit(2)
}

let imageURL = URL(fileURLWithPath: CommandLine.arguments[1])
let expected = CommandLine.arguments.count >= 3
  ? CommandLine.arguments[2]
  : "https://lynch715.github.io/kaige-film-company/"

let request = VNDetectBarcodesRequest()
request.symbologies = [.qr]
let handler = VNImageRequestHandler(url: imageURL)
try handler.perform([request])

let payloads = (request.results ?? []).compactMap(\.payloadStringValue)
payloads.forEach { print($0) }
guard payloads.contains(expected) else {
  fputs("未解码到期望链接\n", stderr)
  exit(1)
}

