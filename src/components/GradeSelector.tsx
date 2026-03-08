interface GradeSelectorProps {
  selectedGrade: number;
  onGradeChange: (grade: number) => void;
  disabled: boolean;
}

const GRADES = [
  { grade: 1, english: 'Grade 1', punjabi: 'ਕਲਾਸ ੧', level: 'Beginner' },
  { grade: 2, english: 'Grade 2', punjabi: 'ਕਲਾਸ ੨', level: 'Easy' },
  { grade: 3, english: 'Grade 3', punjabi: 'ਕਲਾਸ ੩', level: 'Elementary' },
  { grade: 4, english: 'Grade 4', punjabi: 'ਕਲਾਸ ੪', level: 'Intermediate' },
  { grade: 5, english: 'Grade 5', punjabi: 'ਕਲਾਸ ੫', level: 'Upper Int.' },
  { grade: 6, english: 'Grade 6', punjabi: 'ਕਲਾਸ ੬', level: 'Advanced' },
  { grade: 7, english: 'Grade 7', punjabi: 'ਕਲਾਸ ੭', level: 'Expert' },
];

export function GradeSelector({
  selectedGrade,
  onGradeChange,
  disabled,
}: GradeSelectorProps) {
  return (
    <div className="grade-selector">
      <p className="section-label">
        ਪੱਧਰ ਚੁਣੋ&nbsp;<span className="section-label-en">/ Choose Reading Level</span>
      </p>
      <div className="grade-grid">
        {GRADES.map(({ grade, english, punjabi, level }) => (
          <button
            key={grade}
            className={`grade-btn${selectedGrade === grade ? ' active' : ''}`}
            onClick={() => onGradeChange(grade)}
            disabled={disabled}
            title={level}
            aria-pressed={selectedGrade === grade}
          >
            <span className="grade-num">{english}</span>
            <span className="grade-pun">{punjabi}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
