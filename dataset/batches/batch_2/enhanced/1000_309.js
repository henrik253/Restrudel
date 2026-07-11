setcpm(96/4)

$: n(2).scale("C:ritusen").s("lt lt mt*2 lt*2").gain(.7)

$: note("c3 f3 a#2 g2").s("bd").lpf(279).gain(.5).struct("1 ~ ~ ~").slow(2)

$: note("a4 g4 a4 c5").s("square").decay(.03).sustain(0).delay(.5).gain(.3)

$: note("a#5 g#5 e5 c#5 ~ f#5 e5 ~ e5 d#5 a#4 ~ ~ b4 ~ a#4").s("square").lpf(4978).gain(.35)
