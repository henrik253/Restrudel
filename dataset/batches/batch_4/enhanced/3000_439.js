setcpm(120/4)

$: note("c4 c4@2 a#3@2").sound("bd sd").lpf(3000).room(1.2).delay(.5).delaytime(".16 | .33").delayfeedback(.4).s("sawtooth")

$: note("C3 Eb3 G2 Bb2").sound("sine square hat hat").lpf(4220).room(1).gain(.5).s("sawtooth")
