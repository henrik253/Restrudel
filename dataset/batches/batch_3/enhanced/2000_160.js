setcpm(110)

$: note("c4 f4 c4 e4").s("sawtooth").gain(0.5).lpf(4000)
$: note("c3 e3 a3 c4").s("square").gain(0.4).lpf(3000)
$: n("4 5 4 3 2 3 2 1").scale("g2:minor:pentatonic").gain(0.3).lpf(4000)
$: n("9 13 12 2 9 12 13 9").scale("c4:minor").gain(0.3).lpf(4000)
