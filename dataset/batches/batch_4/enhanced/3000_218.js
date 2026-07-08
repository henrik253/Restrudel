setcpm(100)

$: note("c4 c4 a4@3 ~ f4 f4@2 ~ d#4 d#4@2 ~ d4 d4@2").transpose(1).lpf(1500).gain(.4)

$: s("oh*4 bd!3").bank("RolandTR909").gain(.8)

$: s("sine recorder_tenor_sus").lpf(600).gain(.5)
