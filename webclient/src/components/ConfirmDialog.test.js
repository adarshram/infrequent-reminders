import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import ConfirmDialog from './ConfirmDialog';
const setupDefault = async ({ title, text, onClose, onConfirm }) => {
	await act(async () => {
		render(
			<ConfirmDialog
				title={title ?? 'Confirm'}
				text={text ?? 'Default Text'}
				onClose={onClose ?? false}
				onConfirm={onConfirm ?? false}
			/>,
		);
	});
};

const tearDown = () => {
	jest.resetAllMocks();
};

test('shows Dialog text , on close and on confirm', async () => {
	const onClose = jest.fn();
	const onConfirm = jest.fn();
	let text = 'Are you Sure?';
	let title = 'Delete Title';
	await setupDefault({ title, text, onClose, onConfirm });

	let subject = screen.getByText(text);
	expect(subject).toBeInTheDocument();

	subject = screen.getByText(title);
	expect(subject).toBeInTheDocument();

	subject = screen.getByRole('button', { name: 'Cancel' });
	expect(subject).toBeInTheDocument();
	fireEvent.click(subject);
	expect(onClose).toBeCalled();

	subject = screen.getByRole('button', { name: 'Confirm' });
	expect(subject).toBeInTheDocument();

	fireEvent.click(subject);
	expect(onConfirm).toBeCalled();
	//fireEvent.click(subject);
	//expect(onClose).toBeCalled();
	/*



	subject = screen.getByRole('textbox', { name: 'Set Name' });
	expect(subject).toBeInTheDocument();
	subject = screen.getByRole('textbox', { name: 'Set Description' });
	expect(subject).toBeInTheDocument();
	subject = screen.queryAllByText(/Create Reminder Set/i);
	expect(subject[0]).toBeInTheDocument();*/
});
