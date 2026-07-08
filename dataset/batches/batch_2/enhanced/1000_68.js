setcpm(120/4)

$: s("woodblock ~ woodblock*2 ~").bank("KorgDDM110").room(.6).gain(.7)

$: s("hh*8").gain(.15)

$: n("-2 3 0 3").scale("c:mixolydian").s("square").gain(.3).clip(1).release(.15)

$: note("<c2 f2>").s("sawtooth").lpf(600).release(.2).gain(.5)
