from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
base_path = ROOT / "开个影视公司-像素主视觉.png"
qr_path = ROOT / "开个影视公司-Pages二维码.png"
out_path = ROOT / "开个影视公司-像素宣传海报.png"

base = Image.open(base_path).convert("RGB")
if base.size != (1024, 1536):
    raise SystemExit(f"主视觉尺寸错误：{base.size}")

qr = Image.open(qr_path).convert("RGB")
draw = ImageDraw.Draw(base)

bold_font_path = "/System/Library/Fonts/STHeiti Medium.ttc"
body_font_path = "/System/Library/Fonts/STHeiti Light.ttc"
title_font = ImageFont.truetype(bold_font_path, 72)
sub_font = ImageFont.truetype(body_font_path, 25)
cta_font = ImageFont.truetype(bold_font_path, 42)
body_font = ImageFont.truetype(body_font_path, 26)
small_font = ImageFont.truetype(body_font_path, 18)

def centered(text, y, font, fill, stroke=0, stroke_fill="#000000"):
    box = draw.textbbox((0, 0), text, font=font, stroke_width=stroke)
    x = (base.width - (box[2] - box[0])) // 2
    draw.text((x, y), text, font=font, fill=fill, stroke_width=stroke, stroke_fill=stroke_fill)

# 顶部标题使用确定性字体绘制，避免生成式图片出现乱码。
centered("开个影视公司", 45, title_font, "#f4d28b", 4, "#20140e")
centered("从旧摄影棚出发，把公司的名字送上银幕", 135, sub_font, "#fff4dd", 2, "#20140e")

# 底部信息区和二维码卡片。
panel_top = 1128
draw.rounded_rectangle((42, panel_top + 28, 982, 1501), radius=16, fill="#171311", outline="#9e6836", width=3)
card = (78, 1187, 376, 1485)
draw.rounded_rectangle(card, radius=14, fill="#ffffff", outline="#d4a454", width=6)
qr_small = qr.resize((270, 270), Image.Resampling.NEAREST)
base.paste(qr_small, (92, 1201))

draw.text((420, 1194), "扫码开机", font=cta_font, fill="#f1c36f")
draw.text((420, 1265), "挑剧本 · 组主创", font=body_font, fill="#fff7e6")
draw.text((420, 1312), "拍电影 · 做发行", font=body_font, fill="#fff7e6")
draw.text((420, 1359), "从小片场做到金幕奖", font=body_font, fill="#fff7e6")
draw.line((420, 1417, 928, 1417), fill="#795231", width=2)
draw.text((420, 1437), "lynch715.github.io/kaige-film-company", font=small_font, fill="#cdb69f")

base.save(out_path, "PNG", optimize=True)
print(out_path)
