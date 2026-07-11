setcpm(100/4)

$: note("d2*8 C F").scale("c2:minor").s("gm_electric_guitar_clean:2 sd*4").gain(0.3)

$: note("g#4@2 ~ f#4 f#4@2").scale("c2:minor").add(-1.5865).gain(0.4)

$: note("c4*2 c4 a#3 c4").scale("c2:minor").sound("sine triangle").lpf(4150).gain(0.5)
