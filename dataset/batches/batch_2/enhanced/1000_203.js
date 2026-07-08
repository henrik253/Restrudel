setcpm(110/4)

$: s("bd ~ sd ~").struct("[x*2 [x x*2] [x*2] ~]/2").bank("RolandTR808").gain(.8)

$: note("g1 a#1 eb2").transpose(12).s("sawtooth").lpf(1500).gain("<0.4 0.45 0.5 0.6>")

$: s("ocarina_vib").slow(2).gain(.4).room(.3)
