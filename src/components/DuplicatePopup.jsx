import { Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText } from '@mui/material';
import PropTypes from 'prop-types';

const DuplicatePopup = ({ relatives, onClose }) => (
	<Dialog open={true} onClose={onClose}>
		<DialogTitle>Related Duplicates</DialogTitle>
		<DialogContent>
			<List>
				{relatives.map((relative, index) => (
					<ListItem key={index}>
						<ListItemText
							primary={`File: ${relative.fileName}`}
							secondary={`Lines: ${relative.startLine} - ${relative.endLine}`}
						/>
					</ListItem>
				))}
			</List>
		</DialogContent>
	</Dialog>
);

DuplicatePopup.propTypes = {
	relatives: PropTypes.array.isRequired,
	onClose: PropTypes.func.isRequired,
};

export default DuplicatePopup;
